<script setup lang="ts">
import { CdxButton } from '@wikimedia/codex'
import AccountTokenListItemLayout from './AccountTokenListItemLayout.vue'
import type { AccountDeveloperTokenListItem } from '../../types/accountTokenList'

/**
 * Personal API key list item — title, Reset/Delete, issued/status/permissions meta.
 */
const properties = defineProps<{
	item: AccountDeveloperTokenListItem
	issuedMetaPrefix: string
	statusMetaPrefix: string
	permissionsMetaPrefix: string
	resetButtonLabel: string
	deleteButtonLabel: string
}>()

const emit = defineEmits<{
	reset: [ tokenId: string ]
	delete: [ tokenId: string ]
}>()

/**
 * Emits reset for this personal API key.
 *
 * @returns Nothing.
 */
function onReset(): void {
	emit( 'reset', properties.item.id )
}

/**
 * Emits delete for this personal API key.
 *
 * @returns Nothing.
 */
function onDelete(): void {
	emit( 'delete', properties.item.id )
}
</script>

<template>
	<AccountTokenListItemLayout>
		<template #title>
			<h3 class="account-developer-token-list-item__title">
				<bdi>{{ properties.item.title }}</bdi>
			</h3>
		</template>

		<template #actions>
			<CdxButton
				weight="quiet"
				@click="onReset"
			>
				{{ properties.resetButtonLabel }}
			</CdxButton>
			<CdxButton
				action="destructive"
				weight="quiet"
				@click="onDelete"
			>
				{{ properties.deleteButtonLabel }}
			</CdxButton>
		</template>

		<div class="account-developer-token-list-item__meta">
			<p class="account-developer-token-list-item__meta-item">
				<span>{{ properties.issuedMetaPrefix }}</span>
				<bdi>{{ properties.item.issuedOn }}</bdi>
			</p>
			<span
				class="account-developer-token-list-item__meta-divider"
				aria-hidden="true"
			/>
			<p class="account-developer-token-list-item__meta-item">
				<span>{{ properties.statusMetaPrefix }}</span>
				<bdi>{{ properties.item.status }}</bdi>
			</p>
			<span
				class="account-developer-token-list-item__meta-divider"
				aria-hidden="true"
			/>
			<p class="account-developer-token-list-item__meta-item">
				<span>{{ properties.permissionsMetaPrefix }}</span>
				<bdi>{{ properties.item.permissions }}</bdi>
			</p>
		</div>
	</AccountTokenListItemLayout>
</template>

<style scoped>
.account-developer-token-list-item__title {
	margin: 0;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-small );
}

.account-developer-token-list-item__meta {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-50 );
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

.account-developer-token-list-item__meta-divider {
	inline-size: 1px;
	block-size: 1rem;
	background-color: var( --border-color-subtle );
	flex-shrink: 0;
}
</style>
