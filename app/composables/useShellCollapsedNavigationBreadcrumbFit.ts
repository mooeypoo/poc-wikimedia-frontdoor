import type { Ref } from 'vue'

interface ShellCollapsedNavigationBreadcrumbFitElements {
	navigationRootRef: Ref<HTMLElement | null>
	primaryBreadcrumbRef: Ref<HTMLElement | null>
	sectionBreadcrumbGroupRef: Ref<HTMLElement | null>
	hasSectionBreadcrumb: Ref<boolean>
	primaryBreadcrumbLabel: Ref<string>
	sectionBreadcrumbLabel: Ref<string>
}

/**
 * Hides the collapsed-navigation subsection before the primary breadcrumb truncates.
 *
 * Measures the full breadcrumb trail against the primary-nav row space left after
 * the “On this page” trigger and the row's computed gap. Resize observation covers
 * viewport and trigger changes; label watchers cover locale and route changes that
 * can alter intrinsic text width without changing the currently rendered box.
 *
 * The section group remains mounted as an invisible fixed-position measurement
 * element while omitted, allowing it to return when enough room becomes available.
 * Scheduled animation frames and observers are cleaned up on unmount.
 *
 * @param elements - Reactive element refs and breadcrumb state to measure.
 * @returns Reactive visibility for the subsection breadcrumb and separator.
 */
export function useShellCollapsedNavigationBreadcrumbFit(
	elements: ShellCollapsedNavigationBreadcrumbFitElements
) {
	const shouldShowSectionBreadcrumb = ref( true )

	let resizeObserver: ResizeObserver | null = null
	let scheduledAnimationFrame: number | null = null

	/**
	 * Parses a computed CSS pixel value, falling back to zero.
	 *
	 * @param value - Computed CSS value.
	 * @returns Numeric pixel value.
	 */
	function parsePixelValue( value: string ): number {
		const parsedValue = Number.parseFloat( value )
		return Number.isFinite( parsedValue ) ? parsedValue : 0
	}

	/**
	 * Reconciles subsection visibility with the row's currently available width.
	 */
	function updateSectionBreadcrumbVisibility(): void {
		if ( !elements.hasSectionBreadcrumb.value ) {
			shouldShowSectionBreadcrumb.value = false
			return
		}

		const navigationElement = elements.navigationRootRef.value
		const primaryBreadcrumbElement = elements.primaryBreadcrumbRef.value
		const sectionBreadcrumbGroupElement = elements.sectionBreadcrumbGroupRef.value
		const breadcrumbsElement = primaryBreadcrumbElement?.parentElement ?? null
		const rowElement = navigationElement?.parentElement ?? null
		const onThisPageElement = rowElement?.querySelector<HTMLElement>(
			'.frontdoor-shell__on-this-page-menu'
		) ?? null
		const menuButtonElement = navigationElement?.querySelector<HTMLElement>(
			'.shell-collapsed-navigation__menu-button'
		) ?? null

		if (
			navigationElement === null
			|| primaryBreadcrumbElement === null
			|| sectionBreadcrumbGroupElement === null
			|| breadcrumbsElement === null
			|| rowElement === null
			|| menuButtonElement === null
		) {
			return
		}

		// Without a header TOC trigger, the breadcrumb may use the whole row.
		if ( onThisPageElement === null || onThisPageElement.getBoundingClientRect().width === 0 ) {
			shouldShowSectionBreadcrumb.value = true
			return
		}

		const rowStyle = getComputedStyle( rowElement )
		const navigationStyle = getComputedStyle( navigationElement )
		const breadcrumbsStyle = getComputedStyle( breadcrumbsElement )
		const availableNavigationInlineSize = rowElement.getBoundingClientRect().width
			- onThisPageElement.getBoundingClientRect().width
			- parsePixelValue( rowStyle.columnGap )

		const primaryBreadcrumbInlineSize = Math.max(
			primaryBreadcrumbElement.scrollWidth,
			primaryBreadcrumbElement.getBoundingClientRect().width
		)
		const requiredNavigationInlineSize =
			menuButtonElement.getBoundingClientRect().width
			+ parsePixelValue( navigationStyle.columnGap )
			+ primaryBreadcrumbInlineSize
			+ parsePixelValue( breadcrumbsStyle.columnGap )
			+ sectionBreadcrumbGroupElement.getBoundingClientRect().width
			+ parsePixelValue( navigationStyle.paddingInlineStart )
			+ parsePixelValue( navigationStyle.paddingInlineEnd )

		// One physical pixel absorbs fractional text and SVG measurements.
		shouldShowSectionBreadcrumb.value =
			requiredNavigationInlineSize <= availableNavigationInlineSize + 1
	}

	/**
	 * Batches resize and label changes into one post-layout measurement.
	 */
	function scheduleVisibilityUpdate(): void {
		if ( scheduledAnimationFrame !== null ) {
			cancelAnimationFrame( scheduledAnimationFrame )
		}

		scheduledAnimationFrame = requestAnimationFrame( () => {
			scheduledAnimationFrame = null
			updateSectionBreadcrumbVisibility()
		} )
	}

	watch(
		[
			elements.hasSectionBreadcrumb,
			elements.primaryBreadcrumbLabel,
			elements.sectionBreadcrumbLabel
		],
		scheduleVisibilityUpdate,
		{ flush: 'post' }
	)

	onMounted( () => {
		if ( typeof ResizeObserver === 'undefined' ) {
			return
		}

		resizeObserver = new ResizeObserver( scheduleVisibilityUpdate )
		for ( const observedElement of [
			elements.navigationRootRef.value?.parentElement,
			elements.navigationRootRef.value,
			elements.primaryBreadcrumbRef.value,
			elements.sectionBreadcrumbGroupRef.value
		] ) {
			if ( observedElement !== null && observedElement !== undefined ) {
				resizeObserver.observe( observedElement )
			}
		}
		scheduleVisibilityUpdate()
	} )

	onUnmounted( () => {
		resizeObserver?.disconnect()
		resizeObserver = null

		if ( scheduledAnimationFrame !== null ) {
			cancelAnimationFrame( scheduledAnimationFrame )
			scheduledAnimationFrame = null
		}
	} )

	return {
		shouldShowSectionBreadcrumb
	}
}
