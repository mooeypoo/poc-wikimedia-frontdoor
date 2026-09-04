/**
 * Node module-resolution hook that lets `node --test` import app modules.
 *
 * The app is compiled by Vite, which resolves extensionless relative
 * specifiers (`from '../../config/mainNavigation'`). Node's ESM resolver does
 * not, so a test that imports any app module transitively reaching one of
 * those fails with `ERR_MODULE_NOT_FOUND` — pointing at the app module rather
 * than at the test, which makes it read like a broken import instead of a
 * runner limitation.
 *
 * Adding extensions across `app/` and `config/` would mean touching ~135
 * imports and writing against Vite's grain in every file thereafter. This hook
 * instead teaches the test runner the one resolution rule it is missing, so
 * app code stays idiomatic and any future test can import any app module.
 *
 * Scoped deliberately: it only ever appends `.ts` (or `/index.ts`) to a
 * *relative* specifier that Node has already failed to resolve. It cannot
 * change how a bare package specifier resolves, and it cannot mask a genuinely
 * missing module — that still throws, with the original error.
 *
 * Registered via `--import` in the root `test` script, which propagates to the
 * per-file child processes `node --test` spawns.
 *
 * Not a build step and not used at runtime: Vite handles this itself.
 */

import { registerHooks } from 'node:module'

/** Suffixes tried, in order, against a specifier Node could not resolve. */
const CANDIDATE_SUFFIXES = [ '.ts', '/index.ts' ]

registerHooks( {
	/**
	 * Resolves a specifier, retrying relative misses with TypeScript suffixes.
	 *
	 * @param specifier - Module specifier as written in the importing module.
	 * @param context - Node resolution context (parent URL, import attributes).
	 * @param nextResolve - Next hook in the chain, or Node's default resolver.
	 * @returns Node resolution result.
	 */
	resolve( specifier, context, nextResolve ) {
		try {
			return nextResolve( specifier, context )
		} catch ( error ) {
			// Anything other than a miss on a relative specifier is a real
			// failure and must surface unchanged.
			if ( error?.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith( '.' ) ) {
				throw error
			}

			for ( const suffix of CANDIDATE_SUFFIXES ) {
				try {
					return nextResolve( `${ specifier }${ suffix }`, context )
				} catch {
					// Try the next candidate; the original error is rethrown below.
				}
			}

			throw error
		}
	}
} )
