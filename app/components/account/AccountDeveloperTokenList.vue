<script setup lang="ts">
import AccountDeveloperTokenListItem from './AccountDeveloperTokenListItem.vue'
import type { AccountDeveloperTokenListItem as AccountDeveloperTokenListItemModel } from '../../types/accountTokenList'

/**
 * List of developer JWT cards for the account dashboard section.
 */
const properties = defineProps<{
	listAriaLabel: string
	items: AccountDeveloperTokenListItemModel[]
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
</script>

<template>
	<ul
		class="account-developer-token-list"
		:aria-label="properties.listAriaLabel"
	>
		<AccountDeveloperTokenListItem
			v-for="item in properties.items"
			:key="item.id"
			:item="item"
			:issued-meta-prefix="properties.issuedMetaPrefix"
			:last-used-meta-prefix="properties.lastUsedMetaPrefix"
			:never-used-label="properties.neverUsedLabel"
			:delete-button-label="properties.deleteButtonLabel"
			:reveal-secret-aria-label="properties.revealSecretAriaLabel"
			:hide-secret-aria-label="properties.hideSecretAriaLabel"
			:copy-secret-aria-label="properties.copySecretAriaLabel"
			:token-secret-actions-aria-label="properties.tokenSecretActionsAriaLabel"
			@delete="emit( 'delete', $event )"
		/>
	</ul>
</template>

<style scoped>
.account-developer-token-list {
	display: flex;
	flex-direction: column;
	gap: 0;
	margin: 0;
	padding: 0;
}
</style>
