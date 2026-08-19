/**
 * Collected problems from a run.
 *
 * Problems are accumulated rather than thrown so that one run reports every
 * structural error it can find, instead of stopping at the first. Errors mean
 * nothing may be written; warnings are reported and the run continues.
 */
export class Diagnostics {
	constructor() {
		/** @type {{ severity: 'error'|'warning', location: string, message: string }[]} */
		this.entries = []
	}

	/**
	 * Records a fatal problem.
	 *
	 * @param {string} location - Human-readable source location.
	 * @param {string} message - What is wrong.
	 * @returns {void}
	 */
	error( location, message ) {
		this.entries.push( { severity: 'error', location, message } )
	}

	/**
	 * Records a non-fatal problem.
	 *
	 * @param {string} location - Human-readable source location.
	 * @param {string} message - What is suspicious.
	 * @returns {void}
	 */
	warn( location, message ) {
		this.entries.push( { severity: 'warning', location, message } )
	}

	/**
	 * Absorbs another collection's entries.
	 *
	 * @param {Diagnostics} other - Collection to absorb.
	 * @returns {void}
	 */
	absorb( other ) {
		this.entries.push( ...other.entries )
	}

	/** @returns {object[]} Fatal entries. */
	get errors() {
		return this.entries.filter( ( entry ) => entry.severity === 'error' )
	}

	/** @returns {object[]} Non-fatal entries. */
	get warnings() {
		return this.entries.filter( ( entry ) => entry.severity === 'warning' )
	}

	/** @returns {boolean} Whether anything fatal was recorded. */
	get hasErrors() {
		return this.entries.some( ( entry ) => entry.severity === 'error' )
	}
}
