#!/usr/bin/env node

/**
 * Seeds an `i18n/explorer-scalar/<locale>.json` catalogue from Scalar's own
 * built-in translation for that locale.
 *
 * Scalar ships community translations for a handful of locales under the MIT
 * licence. Where one exists for a locale we support, copying it is better than
 * either adopting it at runtime or inventing strings: it is real translation
 * work by people who know the product, it costs nothing, and once copied the
 * strings are ours to revise toward Wikimedia terminology.
 *
 * This is a starting point, not a finished catalogue. Seeded strings have not
 * been reviewed by a Wikimedia translator and may use vocabulary that differs
 * from the rest of the portal. The `@metadata` block records that.
 *
 * Safety: a seeded catalogue is marked `@metadata.seeded: true`. This script
 * refuses to overwrite any catalogue lacking that marker, so it can never
 * destroy reviewed translation work — the same rule the prose-content stub
 * generator follows.
 *
 * Locales with no Scalar built-in (notably `he` and `fa`, the two the portal
 * most needs) get nothing from this script and must be authored by hand.
 *
 * Usage:
 *   npm run seed-scalar-localization -- es fr
 *   npm run seed-scalar-localization -- --list
 *
 * See docs/adr-scalar-interface-localization.md §4.
 */

import { createRequire } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { GENERATED_SCALAR_LOCALIZATION_MAP } from '../config/generated/scalarLocalization.generated.ts'
// The accessor, not the generated catalog: a locale this script accepts must be
// a locale the interface can actually be switched to, resolved the same way the
// UI resolves it — LANGUAGE_OVERRIDES included.
import { getLanguageByCode } from '../config/languages.ts'

const projectRoot = dirname( dirname( fileURLToPath( import.meta.url ) ) )
const messagesDirectory = join( projectRoot, 'i18n', 'explorer-scalar' )

const require = createRequire( import.meta.url )
const scalarDistDirectory = dirname( require.resolve( '@scalar/api-reference' ) )
// Read rather than require: Scalar's `exports` map does not expose
// `./package.json`, so the version has to come off disk.
const scalarPackageVersion = JSON.parse(
	await readFile( join( scalarDistDirectory, '..', 'package.json' ), 'utf8' )
).version

/**
 * Scalar's built-in locale files, keyed by **our** language-catalog code.
 *
 * Two mismatches make this an explicit table rather than a derivation. Scalar's
 * file naming does not always match its own locale key, and its locale keys do
 * not always match Wikimedia's: Scalar's `zh-CN` is `zh-cn` in
 * `config/languages.ts`. Keying by our code means the rest of the script never
 * has to think about whose namespace a code belongs to.
 *
 * Every code here is verified present in the language catalog.
 */
const SCALAR_BUILT_IN_LOCALE_FILES = {
	ar: 'ar.js',
	de: 'de.js',
	es: 'es.js',
	fr: 'fr.js',
	pt: 'pt.js',
	ru: 'ru.js',
	'zh-cn': 'zh-cn.js'
}

/**
 * Reads one value out of a nested object by dot-path.
 *
 * @param source - Nested translation object.
 * @param dotPath - Path such as `operation.testRequest`.
 * @returns The string at that path, or undefined.
 */
function readByPath( source, dotPath ) {
	const value = dotPath.split( '.' ).reduce(
		( current, segment ) =>
			current && typeof current === 'object' ? current[ segment ] : undefined,
		source
	)

	return typeof value === 'string' ? value : undefined
}

/**
 * Rewrites Scalar's `{name}` placeholders into banana's positional `$n` form.
 *
 * Placeholder *order* is taken from the generated map, not from the translated
 * string, so a translation that reorders its placeholders still maps each one
 * to the argument Scalar will substitute.
 *
 * @param value - Translated string in Scalar's placeholder syntax.
 * @param parameterNames - Ordered placeholder names for this message.
 * @returns The string in banana's `$n` syntax.
 */
function toBananaMessage( value, parameterNames = [] ) {
	return parameterNames.reduce(
		( message, parameterName, index ) =>
			message.replaceAll( `{${ parameterName }}`, `$${ index + 1 }` ),
		value
	)
}

/**
 * Loads one of Scalar's built-in translation tables.
 *
 * @param localeCode - Locale code present in SCALAR_BUILT_IN_LOCALE_FILES.
 * @returns The nested translation object.
 */
async function loadScalarBuiltInLocale( localeCode ) {
	const localePath = join(
		scalarDistDirectory,
		'features',
		'localization',
		'locales',
		SCALAR_BUILT_IN_LOCALE_FILES[ localeCode ]
	)

	const localeModule = await import( pathToFileURL( localePath ).href )
	const table = Object.values( localeModule ).find(
		( value ) => value !== null && typeof value === 'object'
	)

	if ( !table ) {
		throw new Error( `no translation object exported from ${ relative( projectRoot, localePath ) }` )
	}

	return table
}

/**
 * Returns whether an existing catalogue may be overwritten.
 *
 * @param cataloguePath - Absolute path to the catalogue.
 * @returns True when the file is absent or carries the seeded marker.
 */
async function isOverwritable( cataloguePath ) {
	let existing

	try {
		existing = JSON.parse( await readFile( cataloguePath, 'utf8' ) )
	} catch {
		return true
	}

	return existing[ '@metadata' ]?.seeded === true
}

const requestedLocales = process.argv.slice( 2 ).filter( ( argument ) => !argument.startsWith( '--' ) )

if ( process.argv.includes( '--list' ) || !requestedLocales.length ) {
	console.log( `Scalar ${ scalarPackageVersion } ships built-in translations for:` )
	console.log( `  ${ Object.keys( SCALAR_BUILT_IN_LOCALE_FILES ).join( ', ' ) }` )
	console.log( '\nSeed one with:  npm run seed-scalar-localization -- es fr' )
	console.log( 'Locales absent from that list (he, fa) must be authored by hand.' )
	process.exit( 0 )
}

const translatableEntries = GENERATED_SCALAR_LOCALIZATION_MAP.filter(
	( entry ) => entry.translatable !== false
)

for ( const localeCode of requestedLocales ) {
	if ( !getLanguageByCode( localeCode ) ) {
		console.error( `"${ localeCode }" is not in the language catalog (config/languages.ts).` )
		process.exitCode = 1
		continue
	}

	if ( !Object.hasOwn( SCALAR_BUILT_IN_LOCALE_FILES, localeCode ) ) {
		console.error( `No Scalar built-in translation for "${ localeCode }". Author it by hand.` )
		process.exitCode = 1
		continue
	}

	const cataloguePath = join( messagesDirectory, `${ localeCode }.json` )

	if ( !await isOverwritable( cataloguePath ) ) {
		console.error( `Refusing to overwrite ${ relative( projectRoot, cataloguePath ) } — it is not marked as seeded.` )
		console.error( '  Reviewed translation work is never rewritten by tooling. Delete it deliberately if that is what you want.' )
		process.exitCode = 1
		continue
	}

	const builtInTable = await loadScalarBuiltInLocale( localeCode )

	const catalogue = {
		'@metadata': {
			seeded: true,
			seededFrom: `@scalar/api-reference@${ scalarPackageVersion } (MIT)`,
			note: 'SEEDED FROM UPSTREAM — not reviewed by a Wikimedia translator. Copied from Scalar\'s own community translation as a starting point; revise toward Wikimedia terminology and remove this marker once reviewed.'
		}
	}

	let copiedCount = 0

	for ( const entry of translatableEntries ) {
		const translatedValue = readByPath( builtInTable, entry.scalarPath )

		// Scalar's own catalogues are themselves incomplete against English.
		// Skipping rather than falling back keeps the gap visible: a key absent
		// here renders English via banana's fallback, which is the intended
		// graceful behaviour and is honest about coverage.
		if ( translatedValue === undefined ) {
			continue
		}

		catalogue[ entry.bananaKey ] = toBananaMessage( translatedValue, entry.parameters )
		copiedCount++
	}

	await writeFile( cataloguePath, `${ JSON.stringify( catalogue, null, '\t' ) }\n`, 'utf8' )

	const coverage = Math.round( ( copiedCount / translatableEntries.length ) * 100 )
	console.log( `${ localeCode }: ${ copiedCount }/${ translatableEntries.length } strings seeded (${ coverage }%) → ${ relative( projectRoot, cataloguePath ) }` )
}
