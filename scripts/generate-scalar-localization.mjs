#!/usr/bin/env node

/**
 * Generates the banana ↔ Scalar interface-string map and the English catalogue.
 *
 * Scalar owns the set of translatable interface strings; we own their
 * translations. That split is the whole reason this script exists. Reading
 * Scalar's built-in English table at the installed version and deriving our
 * keys from it means the mapping cannot silently disagree with upstream — and
 * `--check` turns an upgrade that renames a string from a silent regression
 * (our translation quietly stops applying, with no error anywhere) into a
 * reviewable diff.
 *
 * Writes three artifacts, all committed and reviewed as a git diff:
 *
 *   config/generated/scalarLocalization.generated.ts   key map + parameter names
 *   i18n/explorer-scalar/en.json                       English source messages
 *   i18n/explorer-scalar/qqq.json                      translator documentation skeleton
 *
 * It never writes a translated catalogue. Translator work is not ours to
 * rewrite — the same rule the prose-content generator follows.
 *
 * Usage:
 *   npm run generate-scalar-localization
 *   npm run generate-scalar-localization -- --check    # exit 1 on drift, write nothing
 *
 * See docs/adr-scalar-interface-localization.md.
 */

import { createRequire } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import {
	SCALAR_LOCALIZATION_KEY_PREFIX,
	SCALAR_LOCALIZATION_EXCLUDED_GROUPS,
	SCALAR_LOCALIZATION_PINNED_PATHS,
	isTranslatableScalarPath,
	isPinnedScalarPath
} from '../config/scalarLocalization.ts'

const projectRoot = dirname( dirname( fileURLToPath( import.meta.url ) ) )

/**
 * Loads Scalar's built-in English interface strings.
 *
 * Scalar publishes no export path to its locale tables — `./features` does not
 * re-export them — so this reaches into the package by file path, resolved
 * from the package entry rather than an assumed `node_modules` layout so
 * hoisting cannot break it. That reach-in is the reason the path is asserted
 * here with a loud failure instead of being allowed to fail as a bare module
 * error: if an upgrade moves the file, the correct response is to find its new
 * home, not to skip generation.
 *
 * @returns Scalar's nested English translation table.
 */
async function loadScalarEnglishTranslations() {
	const require = createRequire( import.meta.url )
	const distDirectory = dirname( require.resolve( '@scalar/api-reference' ) )
	const localePath = join( distDirectory, 'features', 'localization', 'locales', 'en.js' )

	try {
		const localeModule = await import( pathToFileURL( localePath ).href )

		if ( !localeModule.en || typeof localeModule.en !== 'object' ) {
			throw new TypeError( 'module loaded but exported no `en` translation object' )
		}

		return localeModule.en
	} catch ( error ) {
		console.error( 'Could not load Scalar\'s built-in English interface strings.' )
		console.error( `  expected at: ${ relative( projectRoot, localePath ) }` )
		console.error( `  ${ error.message }` )
		console.error( '\n@scalar/api-reference publishes no export path for its locale tables, so this' )
		console.error( 'script resolves the file directly. An upgrade has probably moved it — locate the' )
		console.error( 'new path and update loadScalarEnglishTranslations(). Do not skip generation:' )
		console.error( 'the committed map would silently drift from upstream.' )
		process.exit( 1 )
	}
}
const generatedMapPath = join( projectRoot, 'config', 'generated', 'scalarLocalization.generated.ts' )
const messagesDirectory = join( projectRoot, 'i18n', 'explorer-scalar' )

const isCheckOnly = process.argv.includes( '--check' )

/**
 * Flattens Scalar's nested translation table into sorted dot-paths.
 *
 * @param translations - Nested translation object.
 * @param pathPrefix - Accumulated dot-path for recursion.
 * @returns Array of `[ dotPath, englishValue ]` pairs, sorted by path.
 */
function flattenTranslations( translations, pathPrefix = '' ) {
	const entries = []

	for ( const [ key, value ] of Object.entries( translations ) ) {
		const dotPath = pathPrefix ? `${ pathPrefix }.${ key }` : key

		if ( value !== null && typeof value === 'object' ) {
			entries.push( ...flattenTranslations( value, dotPath ) )
			continue
		}

		entries.push( [ dotPath, String( value ) ] )
	}

	return entries.sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) )
}

/**
 * Derives a banana message key from a Scalar translation path.
 *
 * Only the forward direction is deterministic: `operation.testRequest` →
 * `operation-test-request` is a total function, while the inverse is ambiguous
 * (`operation-test-request` could be `operation.testRequest` or
 * `operation.test.request`). This is why the map is generated and committed
 * rather than derived at runtime in either direction.
 *
 * @param scalarPath - Dot-path into Scalar's translation table.
 * @returns Prefixed, kebab-cased banana message key.
 */
function deriveBananaKey( scalarPath ) {
	const kebab = scalarPath
		.replace( /\./g, '-' )
		.replace( /([a-z0-9])([A-Z])/g, '$1-$2' )
		.toLowerCase()

	return `${ SCALAR_LOCALIZATION_KEY_PREFIX }${ kebab }`
}

/**
 * Extracts Scalar's `{name}`-style placeholders from an English string.
 *
 * Order is significant: the nth placeholder becomes banana's `$n`, so a
 * reordering upstream is a real change that must show up in the diff.
 *
 * @param englishValue - Scalar's English string.
 * @returns Placeholder names in order of first appearance, without braces.
 */
function extractPlaceholderNames( englishValue ) {
	const placeholderNames = []

	for ( const match of englishValue.matchAll( /\{(\w+)\}/g ) ) {
		if ( !placeholderNames.includes( match[ 1 ] ) ) {
			placeholderNames.push( match[ 1 ] )
		}
	}

	return placeholderNames
}

/**
 * Rewrites Scalar's `{name}` placeholders into banana's positional `$n` form.
 *
 * Translators work in banana's own convention and never see a foreign
 * placeholder token they would have to preserve byte-for-byte. The injection
 * layer converts back — see `app/scalar/scalarLocalization.ts`.
 *
 * @param englishValue - Scalar's English string.
 * @param placeholderNames - Ordered placeholder names from {@link extractPlaceholderNames}.
 * @returns The string with `{name}` replaced by `$1`, `$2`, …
 */
function toBananaMessage( englishValue, placeholderNames ) {
	return placeholderNames.reduce(
		( message, placeholderName, index ) =>
			message.replaceAll( `{${ placeholderName }}`, `$${ index + 1 }` ),
		englishValue
	)
}

/**
 * Builds the documentation skeleton for one message.
 *
 * The mechanical half — where the string lives upstream, what it says in
 * English, and what each parameter carries — is filled in here. The half that
 * needs a human is what the string *means* in context, marked with TODO so an
 * unwritten entry is greppable rather than merely thin.
 *
 * @param scalarPath - Dot-path into Scalar's translation table.
 * @param englishValue - Scalar's English string.
 * @param placeholderNames - Ordered placeholder names.
 * @returns qqq documentation string.
 */
function buildDocumentation( scalarPath, englishValue, placeholderNames ) {
	const parameterNotes = placeholderNames.map( ( placeholderName, index ) =>
		` $${ index + 1 } is the ${ placeholderName } Scalar interpolates — an external string from the OpenAPI document (a tag, schema or operation name), so it arrives already BiDi-isolated.`
	).join( '' )

	return `TODO: describe where this appears. Scalar API reference interface string \`${ scalarPath }\`; English default "${ englishValue }".${ parameterNotes }`
}

/**
 * Serializes a JSON catalogue with the project's stable formatting.
 *
 * @param payload - Object to serialize.
 * @returns Tab-indented JSON with a trailing newline.
 */
function serializeCatalogue( payload ) {
	return `${ JSON.stringify( payload, null, '\t' ) }\n`
}

/**
 * Renders the generated TypeScript map module.
 *
 * @param mappedEntries - All upstream entries, including excluded groups.
 * @returns File contents.
 */
function renderGeneratedMap( mappedEntries ) {
	const rows = mappedEntries.map( ( entry ) => {
		const parameters = entry.placeholderNames.length
			? `, parameters: [ ${ entry.placeholderNames.map( ( name ) => `'${ name }'` ).join( ', ' ) } ]`
			: ''
		const translatable = entry.isTranslatable ? '' : ', translatable: false'
		const pinned = entry.isPinned
			? `, pinnedEnglish: ${ JSON.stringify( entry.englishValue ) }`
			: ''

		return `\t{ bananaKey: '${ entry.bananaKey }', scalarPath: '${ entry.scalarPath }'${ parameters }${ translatable }${ pinned } }`
	} ).join( ',\n' )

	return `/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Maps banana message keys to paths in Scalar's interface translation table,
 * derived from the built-in English table of the installed @scalar/api-reference.
 *
 * Entries with \`translatable: false\` carry no message and are never sent to
 * translators. Two different reasons produce that flag, and only one of them
 * also carries \`pinnedEnglish\`:
 *
 *   - group not rendered by the explorer (SCALAR_LOCALIZATION_EXCLUDED_GROUPS):
 *     omitted from the payload entirely, so Scalar shows whatever it likes.
 *   - path pinned to English (SCALAR_LOCALIZATION_PINNED_PATHS): the English
 *     value is written into every locale, because omitting it would let
 *     Scalar's own built-in translation supply one.
 *
 * Everything upstream is mapped either way so drift detection stays complete.
 *
 * Regenerate with:
 *   npm run generate-scalar-localization
 * then review the git diff. See docs/adr-scalar-interface-localization.md.
 */

export interface GeneratedScalarLocalizationEntry {
	/** banana message key in the \`i18n/explorer-scalar/\` namespace. */
	bananaKey: string
	/** Dot-path into Scalar's \`localization.translations\` object. */
	scalarPath: string
	/** Scalar placeholder names in order; banana's \`$1\`…\`$n\` map to these. */
	parameters?: string[]
	/** Absent means translatable. \`false\` means excluded or pinned. */
	translatable?: false
	/** Present on pinned paths: the English value to force in every locale. */
	pinnedEnglish?: string
}

export const GENERATED_SCALAR_LOCALIZATION_MAP: readonly GeneratedScalarLocalizationEntry[] = [
${ rows }
]
`
}

/**
 * Reads an existing artifact, or returns null when it does not exist yet.
 *
 * @param filePath - Absolute path to read.
 * @returns File contents, or null.
 */
async function readIfPresent( filePath ) {
	try {
		return await readFile( filePath, 'utf8' )
	} catch {
		return null
	}
}

const flatEntries = flattenTranslations( await loadScalarEnglishTranslations() )

const mappedEntries = flatEntries.map( ( [ scalarPath, englishValue ] ) => {
	const placeholderNames = extractPlaceholderNames( englishValue )

	return {
		scalarPath,
		englishValue,
		placeholderNames,
		bananaKey: deriveBananaKey( scalarPath ),
		isTranslatable: isTranslatableScalarPath( scalarPath ),
		isPinned: isPinnedScalarPath( scalarPath )
	}
} )

// A collision means two upstream paths flatten to one banana key, which would
// make one string silently overwrite the other. It is unreachable at the
// current Scalar version and must stay that way; failing loudly here is the
// only thing standing between an upgrade and a mistranslated interface.
const keyOwners = new Map()
const collisions = []

for ( const entry of mappedEntries ) {
	const existingOwner = keyOwners.get( entry.bananaKey )

	if ( existingOwner ) {
		collisions.push( `${ existingOwner } and ${ entry.scalarPath } both derive ${ entry.bananaKey }` )
		continue
	}

	keyOwners.set( entry.bananaKey, entry.scalarPath )
}

if ( collisions.length ) {
	console.error( 'Scalar translation paths collide under key derivation:' )
	for ( const collision of collisions ) {
		console.error( `  ${ collision }` )
	}
	console.error( '\nResolve by disambiguating the derivation before regenerating.' )
	process.exit( 1 )
}

const translatableEntries = mappedEntries.filter( ( entry ) => entry.isTranslatable )

const englishCatalogue = {
	'@metadata': {
		note: 'GENERATED FILE — DO NOT EDIT BY HAND. Regenerate with `npm run generate-scalar-localization`.'
	}
}
const documentationCatalogue = {
	'@metadata': {
		note: 'GENERATED FILE — DO NOT EDIT BY HAND. Regenerate with `npm run generate-scalar-localization`. TODO entries need a human sentence of context.'
	}
}

for ( const entry of translatableEntries ) {
	englishCatalogue[ entry.bananaKey ] = toBananaMessage( entry.englishValue, entry.placeholderNames )
	documentationCatalogue[ entry.bananaKey ] = buildDocumentation(
		entry.scalarPath,
		entry.englishValue,
		entry.placeholderNames
	)
}

const artifacts = [
	{ path: generatedMapPath, contents: renderGeneratedMap( mappedEntries ) },
	{ path: join( messagesDirectory, 'en.json' ), contents: serializeCatalogue( englishCatalogue ) },
	{ path: join( messagesDirectory, 'qqq.json' ), contents: serializeCatalogue( documentationCatalogue ) }
]

const excludedCount = mappedEntries.length - translatableEntries.length

if ( isCheckOnly ) {
	const drifted = []

	for ( const artifact of artifacts ) {
		const existing = await readIfPresent( artifact.path )

		if ( existing !== artifact.contents ) {
			drifted.push( relative( projectRoot, artifact.path ) )
		}
	}

	if ( drifted.length ) {
		console.error( 'Scalar interface strings have drifted from the committed artifacts:' )
		for ( const path of drifted ) {
			console.error( `  ${ path }` )
		}
		console.error( '\nRun `npm run generate-scalar-localization` and review the diff.' )
		console.error( 'A path that disappeared upstream means a translation that silently stopped applying.' )
		process.exit( 1 )
	}

	console.log( `Scalar localization artifacts are current (${ mappedEntries.length } upstream strings).` )
	process.exit( 0 )
}

await mkdir( messagesDirectory, { recursive: true } )

for ( const artifact of artifacts ) {
	await writeFile( artifact.path, artifact.contents, 'utf8' )
}

console.log( `Mapped ${ mappedEntries.length } Scalar interface strings.` )
console.log( `  ${ translatableEntries.length } offered to translators` )
console.log( `  ${ excludedCount } excluded:` )
console.log( `    groups: ${ Object.keys( SCALAR_LOCALIZATION_EXCLUDED_GROUPS ).join( ', ' ) }` )
console.log( `    pinned to English: ${ Object.keys( SCALAR_LOCALIZATION_PINNED_PATHS ).join( ', ' ) }` )
console.log( '\nReview the git diff, then write the TODO entries in i18n/explorer-scalar/qqq.json.' )
