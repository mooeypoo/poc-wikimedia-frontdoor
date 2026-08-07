/**
 * A heading entry for on-this-page navigation (`h2`, optionally with nested `h3`).
 */
export interface OnThisPageHeading {
	/** DOM `id` used for `#` anchors. */
	id: string
	/** Visible heading text (content string — BiDi-isolate in templates). */
	label: string
	/** Heading level (`2` or `3`). */
	level: 2 | 3
	/** Nested `h3` entries under an `h2` (empty for `h3` leaves). */
	children: OnThisPageHeading[]
}

/**
 * Collects `h2` / `h3` headings with ids from a content root into a shallow tree.
 *
 * Only `h2` and nested `h3` are included (deeper levels ignored). Headings without
 * an `id` are skipped. Label text excludes the permalink anchor control.
 *
 * @param contentRoot - Element that contains rendered content (e.g. `.fd-content-page`).
 * @returns Top-level `h2` entries with nested `h3` children in document order.
 */
export function collectOnThisPageHeadings(
	contentRoot: Element | null | undefined
): OnThisPageHeading[] {
	if ( !contentRoot ) {
		return []
	}

	const headingElements = contentRoot.querySelectorAll<HTMLElement>( 'h2[id], h3[id]' )
	const sections: OnThisPageHeading[] = []
	let currentSection: OnThisPageHeading | null = null

	for ( const headingElement of headingElements ) {
		const headingId = headingElement.id.trim()

		if ( !headingId ) {
			continue
		}

		const label = resolveHeadingLabel( headingElement )

		if ( !label ) {
			continue
		}

		const tagName = headingElement.tagName.toLowerCase()

		if ( tagName === 'h2' ) {
			currentSection = {
				id: headingId,
				label,
				level: 2,
				children: []
			}
			sections.push( currentSection )
			continue
		}

		if ( tagName === 'h3' && currentSection ) {
			currentSection.children.push( {
				id: headingId,
				label,
				level: 3,
				children: []
			} )
		}
	}

	return sections
}

/**
 * Reads visible heading text, omitting the permalink control.
 *
 * @param headingElement - Heading element with optional `.prose-heading__anchor`.
 * @returns Trimmed label text.
 */
function resolveHeadingLabel( headingElement: HTMLElement ): string {
	const clone = headingElement.cloneNode( true ) as HTMLElement
	clone.querySelectorAll( '.prose-heading__anchor' ).forEach( ( anchor ) => {
		anchor.remove()
	} )
	// SectionHeading chips are content chrome — keep their text out of TOC labels.
	clone.querySelectorAll( '.cdx-info-chip' ).forEach( ( chip ) => {
		chip.remove()
	} )

	return clone.textContent?.replace( /\s+/g, ' ' ).trim() ?? ''
}

/**
 * Flattens the heading tree into document order (for MenuButton items / scrollspy).
 *
 * @param sections - Tree from {@link collectOnThisPageHeadings}.
 * @returns Flat list of `h2` then nested `h3` entries.
 */
export function flattenOnThisPageHeadings(
	sections: OnThisPageHeading[]
): OnThisPageHeading[] {
	const flatHeadings: OnThisPageHeading[] = []

	for ( const section of sections ) {
		flatHeadings.push( section )
		for ( const child of section.children ) {
			flatHeadings.push( child )
		}
	}

	return flatHeadings
}
