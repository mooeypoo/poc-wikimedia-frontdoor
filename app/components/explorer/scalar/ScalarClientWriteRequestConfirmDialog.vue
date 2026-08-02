<script setup lang="ts">
import { CdxDialog } from '@wikimedia/codex'
import type { ModalAction, PrimaryModalAction } from '@wikimedia/codex'
import { computed } from 'vue'
import { isolatePickerLabel } from '../../../utils/bidiLabel'
import { getInterfaceMessageTemplate, splitMessageAtFirstPositionalParameter } from '../../../utils/getInterfaceMessageTemplate'

/** Teleport target: Scalar reference panel on the explorer page (not `<body>`). */
const WRITE_CONFIRM_DIALOG_TELEPORT_TARGET = '#explorer-reference-panel'

/**
 * Codex confirmation dialog before sending a write request from the Scalar Test Request modal.
 *
 * Presentational: open state and actions come from {@link useScalarClientWriteRequestConfirmDialog}.
 * Gated by {@link SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED} (easy to undo).
 *
 * Teleports into `#explorer-reference-panel` so the backdrop circumscribes the Scalar
 * embed section only. The dialog component must be a **sibling** of that panel (not a
 * descendant) — Vue Teleport cannot target an ancestor of the Teleport source.
 * Footer actions stay end-aligned like Codex Dialog; Confirm is only swapped to
 * the left of Cancel within that group — see `ARCHITECTURE.md` → Codex exception #13.
 */
const props = defineProps<{
	/** Whether the dialog is open (`v-model:open`). */
	open: boolean
	/** Production wiki display name for `$1` (external string). */
	productionWikiDisplayName: string
	/** Progressive primary action (Confirm). */
	primaryAction: PrimaryModalAction
	/** Neutral default action (Cancel). */
	defaultAction: ModalAction
	/** Accessible label for the header close control. */
	closeButtonLabel: string
}>()

const emit = defineEmits<{
	'update:open': [ isOpen: boolean ]
	primary: []
	cancel: []
}>()

/**
 * Builds a dialog title string with BiDi isolation around the wiki display name.
 *
 * `CdxDialog` `title` is a plain string (no HTML), so FSI/PDI wraps `$1`.
 *
 * @returns Localized title with isolated production wiki name.
 */
const dialogTitle = computed( () => {
	const titleSegments = splitMessageAtFirstPositionalParameter(
		getInterfaceMessageTemplate( 'explorer-scalar-write-confirm-title' )
	)

	return titleSegments.beforeParameter
		+ isolatePickerLabel( props.productionWikiDisplayName )
		+ titleSegments.afterParameter
} )

const bodySegments = computed( () => {
	return splitMessageAtFirstPositionalParameter(
		getInterfaceMessageTemplate( 'explorer-scalar-write-confirm-body' )
	)
} )

/**
 * Forwards dialog open state to the parent.
 *
 * @param isOpen - Next open state from `CdxDialog`.
 * @returns Nothing.
 */
function onUpdateOpen( isOpen: boolean ): void {
	emit( 'update:open', isOpen )
}

/**
 * Handles Confirm (progressive primary).
 *
 * @returns Nothing.
 */
function onPrimary(): void {
	emit( 'primary' )
}

/**
 * Handles Cancel (neutral default).
 *
 * @returns Nothing.
 */
function onDefault(): void {
	emit( 'cancel' )
}
</script>

<template>
	<!--
		`target` keeps the overlay inside the Scalar reference panel.
		Footer Confirm-left-of-Cancel (end-aligned group) styles live in
		explorer-codex-overrides.css (teleported DOM; Codex exception #13).
	-->
	<CdxDialog
		class="scalar-write-request-confirm-dialog"
		:target="WRITE_CONFIRM_DIALOG_TELEPORT_TARGET"
		:open="open"
		:title="dialogTitle"
		:use-close-button="true"
		:close-button-label="closeButtonLabel"
		:primary-action="primaryAction"
		:default-action="defaultAction"
		@update:open="onUpdateOpen"
		@primary="onPrimary"
		@default="onDefault"
	>
		<p class="scalar-write-request-confirm-dialog__body">
			{{ bodySegments.beforeParameter }}<bdi>{{ productionWikiDisplayName }}</bdi>{{ bodySegments.afterParameter }}
		</p>
	</CdxDialog>
</template>

<style scoped>
/* Body: Codex Dialog `--font-size-medium` (16px). Title 18px is in explorer-codex-overrides.css. */
.scalar-write-request-confirm-dialog__body {
	margin-block: 0;
	margin-inline: 0;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-medium );
}
</style>
