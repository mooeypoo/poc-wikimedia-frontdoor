import type { H3Event } from 'h3'
import type { Collections } from '@nuxt/content'
import { queryCollection } from '@nuxt/content/server'

/*
 * Two ways a queried path makes @nuxt/content reject its own generated SQL,
 * both of which leave the path unqueryable, so callers answer a miss rather
 * than a 500 out of a public endpoint.
 *
 * A comment sequence reads as a comment to a scanner that never notices it is
 * inside a quoted literal (internal/security.js:58-77). A line terminator
 * fails a different check: the statement-shape regex on line 3 of that file
 * carries no `s` flag, so its `.` cannot cross one, and a path holding a
 * newline drops the whole statement out of the match, which answered 500 on
 * a URL as ordinary as `/a%0Ab`. The literal itself is never in danger either
 * way, since embedded quotes are doubled and SQLite honours no backslash
 * escapes.
 *
 * `Zl` and `Zp` are the Unicode line and paragraph separators, which JavaScript
 * counts as line terminators too. Naming them by property rather than by escape
 * keeps them out of this source file as well as out of the query.
 */
export const UNQUERYABLE_CONTENT_PATH_PATTERN = /--|\/\*|[\n\r\p{Zl}\p{Zp}]/u

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
