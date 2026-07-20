import { copyTextToClipboard } from '../utils/accountTokenSecret'

/**
 * How long the Reset success “Copied!” `CdxTooltip` stays visible after a quiet copy click.
 *
 * Kept as a named constant (not a remount trigger) so the copy button stays mounted —
 * remounting via `:key` after copy removed the control from the layout.
 */
export const ACCOUNT_RESET_COPIED_TOOLTIP_DURATION_MS = 2000

/**
 * Copies credential text and briefly shows a Codex “Copied!” tooltip via focus/blur.
 *
 * Encapsulates clipboard + tooltip timing so presentational copy buttons stay free of
 * business/UI-feedback logic (AGENTS: no logic in Vue components). The trigger element
 * must remain mounted; do not remount it when showing the tooltip.
 *
 * @returns Copy handler that focuses the trigger to reveal `CdxTooltip`, then blurs after
 *   {@link ACCOUNT_RESET_COPIED_TOOLTIP_DURATION_MS}.
 */
export function useCopyWithCopiedTooltip() {
	let copiedTooltipClearTimeoutId: ReturnType<typeof setTimeout> | null = null

	/**
 * Copies `text` to the clipboard and briefly focuses `triggerElement` so `CdxTooltip` shows.
 *
 * Uses {@link copyTextToClipboard} (Async Clipboard API with `execCommand` fallback).
 * On failure, returns without showing the tooltip so success is never implied.
 *
 * @param text - Credential value to copy.
 * @param triggerElement - Focusable host for the tooltip directive (usually the quiet button root).
 * @returns Promise that resolves when the copy attempt finishes (failures are swallowed).
 */
	async function copyAndShowCopiedTooltip(
		text: string,
		triggerElement: HTMLElement | null
	): Promise<void> {
		try {
			await copyTextToClipboard( text )
		} catch {
			// Clipboard unavailable or denied — skip tooltip so we never claim success.
			return
		}

		if ( !text ) {
			return
		}

		if ( copiedTooltipClearTimeoutId !== null ) {
			clearTimeout( copiedTooltipClearTimeoutId )
		}

		await nextTick()
		triggerElement?.focus()

		copiedTooltipClearTimeoutId = setTimeout( () => {
			triggerElement?.blur()
			copiedTooltipClearTimeoutId = null
		}, ACCOUNT_RESET_COPIED_TOOLTIP_DURATION_MS )
	}

	onBeforeUnmount( () => {
		if ( copiedTooltipClearTimeoutId !== null ) {
			clearTimeout( copiedTooltipClearTimeoutId )
		}
	} )

	return {
		copyAndShowCopiedTooltip
	}
}
