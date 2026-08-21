#!/usr/bin/env node

/**
 * Command line entry point.
 *
 * Usage:
 *   banana-content [--config <path>] [--extract-only | --generate-only] [--check]
 */

import { relative } from 'node:path'
import { getConfig } from './config.js'
import { run } from './run.js'

const USAGE = `Usage: banana-content [options]

  --config <path>   Explicit config file, bypassing lookup
  --extract-only    Write message catalogues only
  --generate-only   Write output files only
  --check           Validate and report; write nothing
  --help            Show this message
`

/**
 * Parses argv.
 *
 * @param {string[]} argv - Arguments after the node and script paths.
 * @returns {object} Parsed options.
 */
function parseArguments( argv ) {
	const options = { extractOnly: false, generateOnly: false, check: false, help: false }
	for ( let i = 0; i < argv.length; i++ ) {
		switch ( argv[ i ] ) {
			case '--config':
				options.configPath = argv[ ++i ]
				break
			case '--extract-only':
				options.extractOnly = true
				break
			case '--generate-only':
				options.generateOnly = true
				break
			case '--check':
				options.check = true
				break
			case '--help':
			case '-h':
				options.help = true
				break
			default:
				throw new Error( `unknown option "${ argv[ i ] }"` )
		}
	}
	if ( options.extractOnly && options.generateOnly ) {
		throw new Error( '--extract-only and --generate-only are mutually exclusive' )
	}
	return options
}

/**
 * Prints collected diagnostics.
 *
 * @param {import('../core/diagnostics.js').Diagnostics} diagnostics - Sink.
 * @returns {void}
 */
function report( diagnostics ) {
	for ( const entry of diagnostics.warnings ) {
		console.warn( `⚠ ${ entry.location }: ${ entry.message }` )
	}
	for ( const entry of diagnostics.errors ) {
		console.error( `✗ ${ entry.location }: ${ entry.message }` )
	}
}

/**
 * Runs the CLI.
 *
 * @returns {Promise<number>} Process exit code.
 */
export async function main() {
	let options
	try {
		options = parseArguments( process.argv.slice( 2 ) )
	} catch ( error ) {
		console.error( `✗ ${ error.message }\n\n${ USAGE }` )
		return 1
	}

	if ( options.help ) {
		console.log( USAGE )
		return 0
	}

	const cwd = process.cwd()
	let config
	try {
		config = await getConfig( { cwd, configPath: options.configPath } )
	} catch ( error ) {
		console.error( `✗ ${ error.message }` )
		return 1
	}

	const result = await run( config, options )
	report( result.diagnostics )

	if ( result.diagnostics.hasErrors ) {
		console.error(
			`\n${ result.diagnostics.errors.length } error(s); nothing was written.`
		)
		return 1
	}

	if ( options.check ) {
		console.log( '✓ no errors' )
		return 0
	}

	if ( result.messageCount !== undefined && !options.generateOnly ) {
		console.log( `✓ extracted ${ result.messageCount } messages` )
	}
	if ( result.removed ) {
		console.log( `✓ removed ${ result.removed } previously generated file(s)` )
	}
	for ( const path of result.written ) {
		console.log( `✓ ${ relative( cwd, path ) }` )
	}
	for ( const entry of result.skipped ) {
		console.log( `· skipped ${ entry.locale }/${ entry.path } (${ entry.percent }%)` )
	}
	return 0
}

process.exitCode = await main()
