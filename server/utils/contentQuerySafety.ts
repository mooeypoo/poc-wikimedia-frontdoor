import type { H3Event } from 'h3'
import type { Collections } from '@nuxt/content'
import { queryCollection } from '@nuxt/content/server'

/*
 * @nuxt/content rejects its own generated SQL as commented when a queried
 * path carries either sequence, because its scanner never notices it is
 * inside a quoted literal (internal/security.js:58-77). Such a path is
 * unqueryable, so callers should answer it as a miss rather than as a 500 out
 * of a public endpoint.
 */
export const UNQUERYABLE_CONTENT_PATH_PATTERN = /--|\/\*/

/**
 * Queries one collection for an exact path, guarding the SQL-comment
 * rejection above and normalizing the match to a plain record.
 *
 * @param event - The current request event.
 * @param collection - Collection to query.
 * @param path - Exact content path to resolve.
 * @returns The matched document, or null on a miss or an unqueryable path.
 */
export async function resolveContentDocument(
	event: H3Event,
	collection: keyof Collections,
	path: string
): Promise<Record<string, unknown> | null> {
	if ( !path || UNQUERYABLE_CONTENT_PATH_PATTERN.test( path ) ) {
		return null
	}

	const document = await queryCollection( event, collection ).path( path ).first()

	return ( document as unknown as Record<string, unknown> ) ?? null
}
