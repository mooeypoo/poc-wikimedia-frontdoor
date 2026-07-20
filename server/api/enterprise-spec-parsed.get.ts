import { createError, defineEventHandler, setResponseHeader } from 'h3'
import { parse as parseYaml } from 'yaml'
import {
	ENTERPRISE_SPEC_UPSTREAM_URL,
	ENTERPRISE_SPEC_USER_AGENT
} from './enterprise-spec.get'

/** HTTP methods extracted from the spec; anything outside this set is ignored. */
const SUPPORTED_METHODS = [ 'get', 'post', 'put', 'patch', 'delete', 'head', 'options' ] as const

type SupportedMethod = typeof SUPPORTED_METHODS[ number ]

/** Bucket key for operations that declare no tags. */
const UNTAGGED_BUCKET_KEY = '__untagged__'

interface EnterpriseSpecTagOutline {
	/** Stable tag id (slug-safe — matches OpenAPI tag name or the synthetic untagged bucket). */
	name: string
	/** Human label preferred for display; falls back to the tag name. */
	displayName: string
	/** OpenAPI tag description, Markdown (rendered client-side). */
	description?: string
}

interface EnterpriseSpecOperationOutline {
	operationId?: string
	method: SupportedMethod
	path: string
	summary?: string
	description?: string
}

interface EnterpriseSpecOutline {
	tags: EnterpriseSpecTagOutline[]
	operationsByTag: Record<string, EnterpriseSpecOperationOutline[]>
}

interface RawSpecTag {
	name?: unknown
	description?: unknown
	'x-displayName'?: unknown
}

interface RawSpecOperation {
	operationId?: unknown
	summary?: unknown
	description?: unknown
	tags?: unknown
}

/**
 * A path item can carry summary/description that apply to all operations on
 * the path (per OpenAPI 3.0 §4.7.9.2). Methods sit alongside these fields.
 */
interface RawSpecPathItem {
	summary?: unknown
	description?: unknown
	[ method: string ]: unknown
}

type RawSpecPaths = Record<string, RawSpecPathItem>

interface RawSpec {
	tags?: RawSpecTag[]
	paths?: RawSpecPaths
}

/**
 * Server-side endpoint that fetches the Enterprise OpenAPI spec, parses YAML,
 * and returns a JSON outline grouped by tag — the data shape consumed by the
 * custom Enterprise viewer ({@link ../../app/composables/useEnterpriseSpecOutline.ts}).
 *
 * Keeps the YAML parser out of the client bundle and centralizes tag
 * derivation server-side so the component can stay rendering-only.
 *
 * @returns JSON payload of shape EnterpriseSpecOutline.
 */
export default defineEventHandler( async ( event ): Promise<EnterpriseSpecOutline> => {
	let rawSpecText: string
	try {
		rawSpecText = await $fetch<string>( ENTERPRISE_SPEC_UPSTREAM_URL, {
			headers: { 'user-agent': ENTERPRISE_SPEC_USER_AGENT },
			responseType: 'text'
		} )
	} catch ( error: unknown ) {
		const statusCode = pickStatusCode( error, 502 )
		throw createError( {
			statusCode,
			statusMessage: 'Failed to fetch Enterprise spec from upstream.'
		} )
	}

	let parsedSpec: RawSpec
	try {
		parsedSpec = parseYaml( rawSpecText ) as RawSpec
	} catch ( error: unknown ) {
		throw createError( {
			statusCode: 502,
			statusMessage: 'Failed to parse Enterprise spec YAML.',
			cause: error
		} )
	}

	const outline = buildOutline( parsedSpec )

	setResponseHeader( event, 'content-type', 'application/json; charset=utf-8' )
	setResponseHeader( event, 'cache-control', 'public, max-age=300' )
	return outline
} )

/**
 * Walks the parsed OpenAPI document, groups operations by their primary tag,
 * and produces an ordered tag list (spec tag order, then any extras discovered
 * only in operations, then the untagged bucket if non-empty).
 *
 * @param spec - Parsed OpenAPI document (loosely typed; defensive checks below).
 * @returns Structured outline keyed by tag.
 */
function buildOutline( spec: RawSpec ): EnterpriseSpecOutline {
	const operationsByTag: Record<string, EnterpriseSpecOperationOutline[]> = {}
	const tagsSeenInOperations = new Set<string>()

	const paths = isRecord( spec.paths ) ? spec.paths : {}
	for ( const [ path, pathItem ] of Object.entries( paths ) ) {
		if ( !isRecord( pathItem ) ) {
			continue
		}
		// Per OpenAPI 3.0, summary/description on the path-item apply to every
		// operation on the path; the operation may override them. We treat them
		// as fallbacks so the custom viewer surfaces something even when authors
		// only put docs at the path level.
		const pathItemSummary = typeof pathItem.summary === 'string' ? pathItem.summary : undefined
		const pathItemDescription =
			typeof pathItem.description === 'string' ? pathItem.description : undefined

		for ( const method of SUPPORTED_METHODS ) {
			const rawOperation = ( pathItem as Record<string, unknown> )[ method ]
			if ( !isRecord( rawOperation ) ) {
				continue
			}
			const operation = rawOperation as RawSpecOperation
			const primaryTag = pickPrimaryTag( operation.tags )
			tagsSeenInOperations.add( primaryTag )

			const operationSummary =
				typeof operation.summary === 'string' ? operation.summary : undefined
			const operationDescription =
				typeof operation.description === 'string' ? operation.description : undefined

			const bucket = operationsByTag[ primaryTag ] ?? ( operationsByTag[ primaryTag ] = [] )
			bucket.push( {
				operationId: typeof operation.operationId === 'string' ? operation.operationId : undefined,
				method,
				path,
				summary: operationSummary ?? pathItemSummary,
				description: operationDescription ?? pathItemDescription
			} )
		}
	}

	const tagOrder: EnterpriseSpecTagOutline[] = []
	const tagsAddedToOrder = new Set<string>()

	// 1. Use spec root `tags:` order, but only include tags that actually appear in operations.
	if ( Array.isArray( spec.tags ) ) {
		for ( const rawTag of spec.tags ) {
			if ( !isRecord( rawTag ) ) {
				continue
			}
			const tagName = typeof rawTag.name === 'string' ? rawTag.name : null
			if ( !tagName || !tagsSeenInOperations.has( tagName ) ) {
				continue
			}
			if ( tagsAddedToOrder.has( tagName ) ) {
				continue
			}
			tagOrder.push( {
				name: tagName,
				displayName: typeof rawTag[ 'x-displayName' ] === 'string'
					? rawTag[ 'x-displayName' ] as string
					: tagName,
				description: typeof rawTag.description === 'string' ? rawTag.description : undefined
			} )
			tagsAddedToOrder.add( tagName )
		}
	}

	// 2. Append tags found only inside operations (no root entry).
	for ( const tagName of tagsSeenInOperations ) {
		if ( tagName === UNTAGGED_BUCKET_KEY || tagsAddedToOrder.has( tagName ) ) {
			continue
		}
		tagOrder.push( { name: tagName, displayName: tagName } )
		tagsAddedToOrder.add( tagName )
	}

	// 3. Append the untagged bucket last, only if non-empty.
	if ( operationsByTag[ UNTAGGED_BUCKET_KEY ]?.length ) {
		tagOrder.push( { name: UNTAGGED_BUCKET_KEY, displayName: UNTAGGED_BUCKET_KEY } )
	}

	return { tags: tagOrder, operationsByTag }
}

/**
 * Returns the first string in an operation's tags array, or the untagged bucket key.
 *
 * @param tags - Operation `tags` field as read from YAML (typed loosely).
 * @returns Primary tag name to bucket the operation under.
 */
function pickPrimaryTag( tags: unknown ): string {
	if ( Array.isArray( tags ) ) {
		for ( const candidate of tags ) {
			if ( typeof candidate === 'string' && candidate.length > 0 ) {
				return candidate
			}
		}
	}
	return UNTAGGED_BUCKET_KEY
}

/**
 * Type guard for plain record-shaped values.
 *
 * @param value - Value to test.
 * @returns True when `value` is a non-null object (not an array).
 */
function isRecord( value: unknown ): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray( value )
}

/**
 * Extracts a numeric statusCode from a thrown error, or returns a fallback.
 *
 * @param error - Thrown value, possibly carrying a Nitro/h3 statusCode field.
 * @param fallback - Default status when no numeric statusCode is present.
 * @returns The detected status code or `fallback`.
 */
function pickStatusCode( error: unknown, fallback: number ): number {
	if (
		typeof error === 'object' &&
		error !== null &&
		'statusCode' in error &&
		typeof ( error as Record<string, unknown> ).statusCode === 'number'
	) {
		return ( error as { statusCode: number } ).statusCode
	}
	return fallback
}

export type {
	EnterpriseSpecOutline,
	EnterpriseSpecTagOutline,
	EnterpriseSpecOperationOutline,
	SupportedMethod
}
