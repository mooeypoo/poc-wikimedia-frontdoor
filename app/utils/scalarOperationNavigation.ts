import GitHubSlugger from 'github-slugger'

export interface ScalarOperationNavigationInput {
	documentSlug: string
	method: string
	path: string
	primaryTag?: string
}

interface ScalarNavigationEntry {
	id?: string
	type?: string
	method?: string
	path?: string
	children?: ScalarNavigationEntry[]
}

interface ScalarWorkspaceStoreShape {
	workspace?: {
		'x-scalar-active-document'?: string
		documents?: Record<string, {
			'x-scalar-navigation'?: {
				children?: ScalarNavigationEntry[]
			}
		}>
	}
}

/**
 * Slugs a Scalar navigation segment the same way the API reference does.
 *
 * @param value - Raw tag or document title segment.
 * @returns GitHub-style slug segment.
 */
export function slugScalarNavigationSegment( value: string ): string {
	return new GitHubSlugger().slug( value )
}

/**
 * Builds Scalar operation navigation ids for a single OpenAPI operation.
 *
 * Mirrors {@link https://github.com/scalar/scalar} default `generateId` logic for
 * operations: `{document}/tag/{tag}/{METHOD}{path}` or `{document}/{METHOD}{path}`.
 *
 * @param input - Document slug, HTTP method, path, and optional primary tag.
 * @returns Ordered candidate navigation ids (most specific first).
 */
/**
 * Resolves the document id segment Scalar uses in navigation ids.
 *
 * @param documentSlug - Config slug or OpenAPI document title.
 * @returns Slug segment for navigation id prefixes.
 */
export function resolveScalarDocumentId( documentSlug: string ): string {
	if ( /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test( documentSlug ) ) {
		return documentSlug
	}

	return slugScalarNavigationSegment( documentSlug )
}

/**
 * Finds an operation navigation id in Scalar's pre-built navigation tree.
 *
 * @param workspaceStore - Scalar workspace store from ApiReference.
 * @param documentSlug - Active document slug from configuration.
 * @param method - HTTP method for the operation.
 * @param path - OpenAPI path template for the operation.
 * @returns Navigation id when a matching entry exists.
 */
export function findOperationNavigationIdInWorkspace(
	workspaceStore: ScalarWorkspaceStoreShape | null | undefined,
	documentSlug: string,
	method: string,
	path: string
): string | null {
	const workspace = workspaceStore?.workspace
	if ( !workspace?.documents ) {
		return null
	}

	const activeDocumentSlug =
		workspace[ 'x-scalar-active-document' ]
		?? documentSlug
		?? Object.keys( workspace.documents )[ 0 ]
	const navigationChildren =
		workspace.documents[ activeDocumentSlug ]?.[ 'x-scalar-navigation' ]?.children

	return findOperationNavigationIdInEntries( navigationChildren, method, path )
}

/**
 * Finds an operation navigation id in Scalar sidebar items exposed by ApiReference.
 *
 * @param sidebarItems - Top-level sidebar entries (document nodes with operation children).
 * @param documentSlug - Configured document slug for the active spec.
 * @param method - HTTP method for the operation.
 * @param path - OpenAPI path template for the operation.
 * @returns Matching navigation id, or null when not found.
 */
export function findOperationNavigationIdInSidebarItems(
	sidebarItems: ScalarNavigationEntry[] | undefined,
	documentSlug: string,
	method: string,
	path: string
): string | null {
	if ( !sidebarItems?.length ) {
		return null
	}

	const documentEntry = sidebarItems.find( ( entry ) => entry.id === documentSlug )
		?? sidebarItems.find( ( entry ) => entry.type === 'document' )

	return findOperationNavigationIdInEntries( documentEntry?.children, method, path )
}

/**
 * Recursively searches Scalar navigation entries for a matching operation.
 *
 * @param entries - Navigation tree entries to search.
 * @param method - HTTP method for the operation.
 * @param path - OpenAPI path template for the operation.
 * @returns Matching navigation id, or null when not found.
 */
export function findOperationNavigationIdInEntries(
	entries: ScalarNavigationEntry[] | undefined,
	method: string,
	path: string
): string | null {
	if ( !entries?.length ) {
		return null
	}

	const normalizedMethod = method.toUpperCase()

	for ( const entry of entries ) {
		if (
			( entry.type === 'operation' || entry.type === 'webhook' )
			&& entry.id
			&& entry.method?.toUpperCase() === normalizedMethod
			&& entry.path === path
		) {
			return entry.id
		}

		const nestedMatch = findOperationNavigationIdInEntries( entry.children, method, path )
		if ( nestedMatch ) {
			return nestedMatch
		}
	}

	return null
}

/**
 * Builds Scalar operation navigation ids for a single OpenAPI operation.
 *
 * Mirrors {@link https://github.com/scalar/scalar} default `generateId` logic for
 * operations: `{document}/tag/{tag}/{METHOD}{path}` or `{document}/{METHOD}{path}`.
 *
 * @param input - Document slug, HTTP method, path, and optional primary tag.
 * @returns Ordered candidate navigation ids (most specific first).
 */
export function buildScalarOperationNavigationIdCandidates(
	input: ScalarOperationNavigationInput
): string[] {
	const documentId = resolveScalarDocumentId( input.documentSlug )
	const httpMethod = input.method.toUpperCase()
	const operationSuffix = `${ httpMethod }${ input.path }`
	const candidates: string[] = []

	if ( input.primaryTag ) {
		candidates.push(
			`${ documentId }/tag/${ slugScalarNavigationSegment( input.primaryTag ) }/${ operationSuffix }`
		)
	}

	candidates.push( `${ documentId }/${ operationSuffix }` )

	return [ ...new Set( candidates ) ]
}

/**
 * Optional Scalar metadata used to resolve operation navigation ids before DOM render.
 */
export interface ScalarNavigationLookupContext {
	workspaceStore?: ScalarWorkspaceStoreShape | null
	sidebarItems?: ScalarNavigationEntry[]
}

/**
 * Resolves the Scalar navigation id for an operation using all available strategies.
 *
 * @param searchRoot - Root element that contains Scalar operation sections.
 * @param input - Operation identity used to build navigation id candidates.
 * @param navigationContext - Optional Scalar workspace store and sidebar items.
 * @returns Matching navigation id, or null when nothing matches yet.
 */
export function resolveScalarOperationNavigationId(
	searchRoot: ParentNode,
	input: ScalarOperationNavigationInput,
	navigationContext?: ScalarNavigationLookupContext | null
): string | null {
	const navigationTreeMatch = findOperationNavigationIdInWorkspace(
		navigationContext?.workspaceStore,
		input.documentSlug,
		input.method,
		input.path
	)

	if ( navigationTreeMatch ) {
		return navigationTreeMatch
	}

	const sidebarMatch = findOperationNavigationIdInSidebarItems(
		navigationContext?.sidebarItems,
		input.documentSlug,
		input.method,
		input.path
	)

	if ( sidebarMatch ) {
		return sidebarMatch
	}

	const httpMethod = input.method.toUpperCase()
	const operationSuffix = `${ httpMethod }${ input.path }`
	const candidateIds = buildScalarOperationNavigationIdCandidates( input )

	for ( const candidateId of candidateIds ) {
		const matchedById =
			'getElementById' in searchRoot && typeof searchRoot.getElementById === 'function'
				? searchRoot.getElementById( candidateId )
				: searchRoot.querySelector<HTMLElement>( `[id="${ escapeCssAttributeValue( candidateId ) }"]` )

		if ( matchedById ) {
			return candidateId
		}
	}

	const suffixMatches = Array.from( searchRoot.querySelectorAll<HTMLElement>( '[id]' ) )
		.map( ( element ) => element.id )
		.filter( ( elementId ) => elementId.endsWith( operationSuffix ) )

	if ( !suffixMatches.length ) {
		return null
	}

	const preferredTaggedMatch = input.primaryTag
		? suffixMatches.find( ( elementId ) => elementId.includes( `/tag/${ slugScalarNavigationSegment( input.primaryTag ) }/` ) )
		: undefined

	if ( preferredTaggedMatch ) {
		return preferredTaggedMatch
	}

	if ( suffixMatches.length === 1 ) {
		return suffixMatches[ 0 ]
	}

	// Prefer the longest id (usually the most qualified tag path) over ambiguous short matches.
	return suffixMatches.sort( ( leftId, rightId ) => rightId.length - leftId.length )[ 0 ]
}

/**
 * Escapes a value for use inside a CSS attribute selector.
 *
 * @param attributeValue - Raw attribute value.
 * @returns Escaped attribute value.
 */
function escapeCssAttributeValue( attributeValue: string ): string {
	return attributeValue.replaceAll( '\\', '\\\\' ).replaceAll( '"', '\\"' )
}
