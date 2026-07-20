<script setup lang="ts">
import { CdxDialog } from '@wikimedia/codex'
import type { ModalAction, PrimaryModalAction } from '@wikimedia/codex'

/**
 * Confirmation dialog for resetting an account API key (Figma node 626:7921).
 *
 * Presentational Codex `CdxDialog` wrapper: close button, Cancel (default), and
 * progressive Reset. Open state, banana labels, and confirm/cancel behaviour come
 * from {@link useAccountResetApiKeyDialog} via props/events (no store access here).
 */
defineProps<{
	/** Whether the dialog is open (`v-model:open`). */
	open: boolean
	/** Dialog title (banana-i18n). */
	title: string
	/** Body confirmation copy (banana-i18n). */
	body: string
	/** Accessible label for the header close control. */
	closeButtonLabel: string
	/** Progressive primary action (Reset). */
	primaryAction: PrimaryModalAction
	/** Neutral default action (Cancel). */
	defaultAction: ModalAction
}>()

const emit = defineEmits<{
	'update:open': [ isOpen: boolean ]
	confirm: []
	cancel: []
}>()

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
 * Handles the progressive Reset action.
 *
 * @returns Nothing.
 */
function onPrimary(): void {
	emit( 'confirm' )
}

/**
 * Handles Cancel (default action).
 *
 * @returns Nothing.
 */
function onDefault(): void {
	emit( 'cancel' )
}
</script>

<template>
	<CdxDialog
		:open="open"
		:title="title"
		:use-close-button="true"
		:close-button-label="closeButtonLabel"
		:primary-action="primaryAction"
		:default-action="defaultAction"
		@update:open="onUpdateOpen"
		@primary="onPrimary"
		@default="onDefault"
	>
		<p class="account-reset-api-key-dialog__body">
			{{ body }}
		</p>
	</CdxDialog>
</template>

<style scoped>
.account-reset-api-key-dialog__body {
	margin: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-medium );
}
</style>
