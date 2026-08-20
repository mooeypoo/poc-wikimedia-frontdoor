/**
 * Pure builders for the `llms.txt` machine-readable surfaces.
 *
 * Kept free of I/O so the Nitro routes that emit these documents and the tests
 * that assert their shape share one implementation.
 *
 * These exist because an AI consumer is served **better** by a content-bearing
 * text file than by HTML pages: it receives the whole corpus in one request, with
 * no crawl budget and no markup to parse. An XML sitemap cannot do this — a
 * sitemap lists addresses, it cannot carry content
 * (docs/adr-static-module-documentation.md §10).
 */

/** A module as the `llms.txt` surfaces describe it. */
export interface LlmsModuleEntry {
	moduleName: string
	title: string
	description: string
	specVersion: string
	instanceTotal: number
	/** Absolute URL of the human-readable reference page. */
	pageUrl: string
	/** Absolute URL of the verbatim OpenAPI spec. */
	specUrl: string
	operations: {
		method: string
		path: string
		summary: string
		anchor: string
	}[]
}

/**
 * Builds the `llms.txt` index.
 *
 * Follows the emerging convention: an H1 title, a blockquote summary, then
 * link sections. Kept short by design — it is a map, and `llms-full.txt` is the
 * territory.
 *
 * @param options - Site origin and the modules to index.
 * @returns The `llms.txt` body.
 */
export function buildLlmsIndex( options: {
	siteOrigin: string
	modules: LlmsModuleEntry[]
	fullCorpusPath?: string
} ): string {
	const totalOperations = options.modules.reduce(
		( total, entry ) => total + entry.operations.length,
		0
	)

	const lines = [
		'# Wikimedia REST API reference',
		'',
		'> Machine-readable index of the Wikimedia REST API modules documented on the ' +
			'Wikimedia Developer Portal. Each module lists its operations and links to a ' +
			'verbatim OpenAPI specification. ' +
			`${ options.modules.length } modules, ${ totalOperations } operations.`,
		'',
		'Module identity is the versioned discovery name (for example `site/v1`). A module ' +
			'is exposed on many Wikimedia wikis; its operations are the same on each, so it ' +
			'is documented once and the wikis are summarised by count.',
		'',
		'## Modules',
		''
	]

	for ( const entry of options.modules ) {
		const descriptor = [
			`${ entry.operations.length } operations`,
			`${ entry.instanceTotal } wikis`
		].join( ', ' )

		lines.push( `- [${ entry.moduleName }](${ entry.pageUrl }): ${ entry.title } — ${ descriptor }. OpenAPI: ${ entry.specUrl }` )
	}

	if ( options.fullCorpusPath ) {
		lines.push(
			'',
			'## Full text',
			'',
			`- [Complete operation prose for every module](${ options.siteOrigin }${ options.fullCorpusPath })`
		)
	}

	return `${ lines.join( '\n' ) }\n`
}

/**
 * Builds `llms-full.txt`: every module's prose in one document.
 *
 * Operation anchors use the canonical anchor vocabulary, so a citation of any
 * operation resolves to a working link on the human-readable page.
 *
 * Operations with no prose are still listed. Their method and path are the only
 * facts the specification provides, and omitting them would misrepresent the API
 * as smaller than it is — 21 operations across two modules declare neither a
 * summary nor a description.
 *
 * @param options - Site origin and the modules to render.
 * @returns The `llms-full.txt` body.
 */
export function buildLlmsFullCorpus( options: {
	siteOrigin: string
	modules: LlmsModuleEntry[]
} ): string {
	const lines = [
		'# Wikimedia REST API reference — full text',
		'',
		'> Every documented Wikimedia REST API module and operation, as plain text. ' +
			'Anchors link to the corresponding heading on the human-readable page.',
		''
	]

	for ( const entry of options.modules ) {
		lines.push(
			`## ${ entry.moduleName }`,
			'',
			`- Title: ${ entry.title }`,
			`- Page: ${ entry.pageUrl }`,
			`- OpenAPI: ${ entry.specUrl }`,
			`- Exposed on: ${ entry.instanceTotal } Wikimedia wikis`
		)

		if ( entry.specVersion ) {
			lines.push( `- Spec version: ${ entry.specVersion }` )
		}

		if ( entry.description ) {
			lines.push( '', entry.description )
		}

		lines.push( '', '### Operations', '' )

		if ( entry.operations.length === 0 ) {
			lines.push( 'This module declares no operations.', '' )
			continue
		}

		for ( const operation of entry.operations ) {
			lines.push( `#### ${ operation.method } ${ operation.path }` )
			lines.push( `Link: ${ entry.pageUrl }#${ operation.anchor }` )
			if ( operation.summary ) {
				lines.push( operation.summary )
			}
			lines.push( '' )
		}
	}

	return `${ lines.join( '\n' ) }\n`
}
