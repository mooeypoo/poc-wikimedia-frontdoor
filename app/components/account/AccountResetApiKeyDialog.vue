<script setup lang="ts">
import { CdxDialog, CdxMessage } from '@wikimedia/codex'
import type { ModalAction, PrimaryModalAction } from '@wikimedia/codex'
import AccountResetCredentialCopyButton from './AccountResetCredentialCopyButton.vue'
import type { AccountResetCredentialRow } from '../../types/accountResetDialog'

/**
 * Reset API key dialog — confirm (Figma 626:7921) then success credentials (Figma 633:7695).
 *
 * Presentational Codex `CdxDialog` wrapper. Step, labels, credential rows, and
 * confirm/done behaviour come from {@link useAccountResetApiKeyDialog}.
 */
defineProps<{
	/** Whether the dialog is open (`v-model:open`). */
	open: boolean
	/** Whether the success (credentials) step is showing. */
	isSuccessStep: boolean
	/** Dialog title (banana-i18n). */
	title: string
	/** Confirm-step body copy (banana-i18n). */
	body: string
	/** Success-step intro copy (banana-i18n). */
	successIntro: string
	/** Success-step warning message (banana-i18n). */
	warning: string
	/** Revealed credential rows for the success step. */
	credentialRows: AccountResetCredentialRow[]
	/** Accessible name for the credentials list. */
	credentialsListAriaLabel: string
	/** Accessible label for quiet copy buttons. */
	copyAriaLabel: string
	/** Tooltip text after a successful copy. */
	copiedTooltipLabel: string
	/** Accessible label for the header close control. */
	closeButtonLabel: string
	/** Progressive primary action (Reset or Done). */
	primaryAction: PrimaryModalAction
	/** Neutral default action (Cancel); omitted on the success step. */
	defaultAction: ModalAction | null
}>()

const emit = defineEmits<{
	'update:open': [ isOpen: boolean ]
	primary: []
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
 * Handles the progressive primary action (Reset or Done).
 *
 * @returns Nothing.
 */
function onPrimary(): void {
	emit( 'primary' )
}

/**
 * Handles Cancel (default action on the confirm step).
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
		:default-action="defaultAction ?? undefined"
		@update:open="onUpdateOpen"
		@primary="onPrimary"
		@default="onDefault"
	>
		<template v-if="isSuccessStep">
			<div class="account-reset-api-key-dialog__success">
				<p class="account-reset-api-key-dialog__body">
					{{ successIntro }}
				</p>

				<ul
					class="account-reset-api-key-dialog__credentials"
					:aria-label="credentialsListAriaLabel"
				>
					<li
						v-for="credentialRow in credentialRows"
						:key="credentialRow.id"
						class="account-reset-api-key-dialog__credential"
					>
						<p class="account-reset-api-key-dialog__credential-text">
							<span class="account-reset-api-key-dialog__credential-label">{{ credentialRow.label }}</span>
							<!-- Credential values are external secrets; isolate and keep LTR for code-like tokens. -->
							<bdi
								class="account-reset-api-key-dialog__credential-value"
								dir="ltr"
							>{{ credentialRow.value }}</bdi>
						</p>
						<AccountResetCredentialCopyButton
							:value="credentialRow.value"
							:copy-aria-label="copyAriaLabel"
							:copied-tooltip-label="copiedTooltipLabel"
						/>
					</li>
				</ul>

				<CdxMessage
					class="account-reset-api-key-dialog__warning"
					type="warning"
					:inline="true"
				>
					{{ warning }}
				</CdxMessage>
			</div>
		</template>
		<p
			v-else
			class="account-reset-api-key-dialog__body"
		>
			{{ body }}
		</p>
	</CdxDialog>
</template>

<style scoped>
.account-reset-api-key-dialog__success {
	display: flex;
	flex-direction: column;
	/* 16px between intro, credential list, and warning (Codex Spacing/100). */
	gap: var( --spacing-100 );
}

.account-reset-api-key-dialog__body {
	margin-block: 0;
	margin-inline: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-medium );
}

.account-reset-api-key-dialog__credentials {
	display: flex;
	flex-direction: column;
	margin-block: 0;
	margin-inline: 0;
	padding-block: 0;
	padding-inline: 0;
	list-style: none;
}

.account-reset-api-key-dialog__credential {
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	column-gap: var( --spacing-50 );
}

.account-reset-api-key-dialog__credential-text {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	column-gap: var( --spacing-25 );
	margin-block: 0;
	margin-inline: 0;
	min-inline-size: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-medium );
	overflow-wrap: anywhere;
}

.account-reset-api-key-dialog__credential-label {
	font-weight: var( --font-weight-bold );
}

.account-reset-api-key-dialog__credential-value {
	font-family: var( --font-family-monospace-stack );
	font-weight: var( --font-weight-normal );
}

.account-reset-api-key-dialog__credential :deep( .cdx-button ) {
	flex-shrink: 0;
}

.account-reset-api-key-dialog__warning {
	margin-block-start: 0;
}
</style>
