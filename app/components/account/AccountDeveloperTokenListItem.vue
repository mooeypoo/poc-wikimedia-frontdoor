<script setup lang="ts">
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconTrash } from '@wikimedia/codex-icons'
import AccountTokenListItemLayout from './AccountTokenListItemLayout.vue'
import AccountTokenSecretCell from './AccountTokenSecretCell.vue'
import type { AccountDeveloperTokenListItem } from '../../types/accountTokenList'

/**
 * Developer JWT list item — title, masked token, issued/last-used metadata, delete.
 */
const properties = defineProps<{
	item: AccountDeveloperTokenListItem
	issuedMetaPrefix: string
	lastUsedMetaPrefix: string
	neverUsedLabel: string
	deleteButtonLabel: string
	revealSecretAriaLabel: string
	hideSecretAriaLabel: string
	copySecretAriaLabel: string
	tokenSecretActionsAriaLabel: string
}>()

const emit = defineEmits<{
	delete: [ tokenId: string ]
}>()

/**
 * Emits delete for this list item.
 *
 * @returns Nothing.
 */
function onDelete(): void {
	emit( 'delete', properties.item.id )
}
</script>

<template>
	<AccountTokenListItemLayout>
		<h3 class="account-developer-token-list-item__title">
			<bdi>{{ properties.item.title }}</bdi>
		</h3>

		<div class="account-developer-token-list-item__secret-row">
			<AccountTokenSecretCell
				:secret-value="properties.item.accessToken"
				:reveal-secret-aria-label="properties.revealSecretAriaLabel"
				:hide-secret-aria-label="properties.hideSecretAriaLabel"
				:copy-secret-aria-label="properties.copySecretAriaLabel"
				:token-secret-actions-aria-label="properties.tokenSecretActionsAriaLabel"
			/>
		</div>

		<div class="account-developer-token-list-item__meta">
			<p class="account-developer-token-list-item__meta-item">
				<span>{{ properties.issuedMetaPrefix }}</span>
				<bdi>{{ properties.item.issuedOn }}</bdi>
			</p>
			<p class="account-developer-token-list-item__meta-item">
				<span>{{ properties.lastUsedMetaPrefix }}</span>
				<bdi v-if="properties.item.lastUsedOn">{{ properties.item.lastUsedOn }}</bdi>
				<span v-else>{{ properties.neverUsedLabel }}</span>
			</p>
		</div>

		<template #actions>
			<CdxButton
				action="destructive"
				weight="normal"
				@click="onDelete"
			>
				<CdxIcon :icon="cdxIconTrash" />
				{{ properties.deleteButtonLabel }}
			</CdxButton>
		</template>
	</AccountTokenListItemLayout>
</template>

<style scoped>
.account-developer-token-list-item__title {
	margin: 0;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-small );
}

.account-developer-token-list-item__secret-row {
	padding-block: var( --spacing-25 );
}

.account-developer-token-list-item__meta {
	display: flex;
	flex-wrap: wrap;
	gap: var( --spacing-100 );
	margin: 0;
	font-size: var( --font-size-small );
	line-height: var( --line-height-small );
	color: var( --color-subtle );
}

.account-developer-token-list-item__meta-item {
	display: inline-flex;
	flex-wrap: wrap;
	gap: var( --spacing-25 );
	margin: 0;
}
</style>
