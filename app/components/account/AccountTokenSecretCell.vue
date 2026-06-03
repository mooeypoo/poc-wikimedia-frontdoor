<script setup lang="ts">
import { CdxButtonGroup } from '@wikimedia/codex'
import type { ButtonGroupItem } from '@wikimedia/codex'
import { cdxIconCopy, cdxIconEye, cdxIconEyeClosed } from '@wikimedia/codex-icons'
import { copyTextToClipboard, maskSecretValue } from '../../utils/accountTokenSecret'

/** `CdxButtonGroup` value for the reveal/hide secret control. */
const SECRET_ACTION_TOGGLE = 'toggle'

/** `CdxButtonGroup` value for the copy-to-clipboard control. */
const SECRET_ACTION_COPY = 'copy'

/**
 * Masked secret with Codex icon-only {@link CdxButtonGroup} reveal and copy controls.
 */
const properties = defineProps<{
	/** Full credential string (from API or prototype seed). */
	secretValue: string
	/** Accessible name when the secret is hidden. */
	revealSecretAriaLabel: string
	/** Accessible name when the secret is visible. */
	hideSecretAriaLabel: string
	/** Accessible name for the copy control. */
	copySecretAriaLabel: string
	/** Accessible name for the reveal/copy control group. */
	tokenSecretActionsAriaLabel: string
}>()

const isSecretVisible = ref( false )

const maskedDisplay = computed( () => maskSecretValue( properties.secretValue ) )

const visibilityToggleIcon = computed( () =>
	isSecretVisible.value ? cdxIconEyeClosed : cdxIconEye
)

const visibilityToggleAriaLabel = computed( () =>
	isSecretVisible.value ? properties.hideSecretAriaLabel : properties.revealSecretAriaLabel
)

/**
 * Icon-only {@link CdxButtonGroup} items for reveal/hide and copy.
 *
 * @returns Button descriptors for {@link CdxButtonGroup}.
 */
const secretActionButtons = computed( (): ButtonGroupItem[] => [
	{
		value: SECRET_ACTION_TOGGLE,
		label: null,
		icon: visibilityToggleIcon.value,
		ariaLabel: visibilityToggleAriaLabel.value
	},
	{
		value: SECRET_ACTION_COPY,
		label: null,
		icon: cdxIconCopy,
		ariaLabel: properties.copySecretAriaLabel
	}
] )

/**
 * Toggles between masked and plain secret display.
 *
 * @returns Nothing.
 */
function onToggleVisibility(): void {
	isSecretVisible.value = !isSecretVisible.value
}

/**
 * Copies the full secret to the clipboard.
 *
 * @returns Nothing.
 */
async function onCopySecret(): Promise<void> {
	try {
		await copyTextToClipboard( properties.secretValue )
	} catch {
		// Clipboard unavailable (SSR or denied permission); no UI feedback in prototype.
	}
}

/**
 * Handles {@link CdxButtonGroup} click events for reveal and copy.
 *
 * @param value - `value` of the clicked button in the group.
 * @returns Nothing.
 */
function onSecretActionClick( value: string | number ): void {
	if ( value === SECRET_ACTION_TOGGLE ) {
		onToggleVisibility()
		return
	}

	if ( value === SECRET_ACTION_COPY ) {
		void onCopySecret()
	}
}
</script>

<template>
	<div class="account-token-secret-cell">
		<!-- LTR: API tokens and client secrets are always left-to-right strings. -->
		<span
			class="account-token-secret-cell__value"
			dir="ltr"
		>
			<bdi v-if="isSecretVisible">{{ properties.secretValue }}</bdi>
			<span
				v-else
				aria-hidden="true"
			>{{ maskedDisplay }}</span>
		</span>
		<CdxButtonGroup
			class="account-token-secret-cell__button-group"
			:buttons="secretActionButtons"
			:aria-label="properties.tokenSecretActionsAriaLabel"
			@click="onSecretActionClick"
		/>
	</div>
</template>

<style scoped>
.account-token-secret-cell {
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	gap: var( --spacing-50 );
	max-inline-size: 100%;
}

.account-token-secret-cell__value {
	flex: 0 1 auto;
	min-inline-size: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-family: var( --font-family-monospace, monospace );
	font-size: var( --font-size-medium );
}

.account-token-secret-cell__button-group {
	flex-shrink: 0;
}
</style>
