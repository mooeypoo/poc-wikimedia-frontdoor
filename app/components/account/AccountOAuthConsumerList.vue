<script setup lang="ts">
import AccountOAuthConsumerListItem from './AccountOAuthConsumerListItem.vue'
import type { AccountOAuthConsumerListItem as AccountOAuthConsumerListItemModel } from '../../types/accountTokenList'

/**
 * List of OAuth consumer cards for the account dashboard section.
 */
const properties = defineProps<{
	listAriaLabel: string
	items: AccountOAuthConsumerListItemModel[]
	registeredMetaPrefix: string
	grantsMetaPrefix: string
	deleteButtonLabel: string
	manageOnMetaButtonLabel: string
	rowActionsMenuAriaLabel: string
	showManageOnMeta: boolean
	revealSecretAriaLabel: string
	hideSecretAriaLabel: string
	copySecretAriaLabel: string
	tokenSecretActionsAriaLabel: string
}>()

const emit = defineEmits<{
	delete: [ consumerId: string ]
	'manage-on-meta': []
}>()
</script>

<template>
	<ul
		class="account-oauth-consumer-list"
		:aria-label="properties.listAriaLabel"
	>
		<AccountOAuthConsumerListItem
			v-for="item in properties.items"
			:key="item.id"
			:item="item"
			:registered-meta-prefix="properties.registeredMetaPrefix"
			:grants-meta-prefix="properties.grantsMetaPrefix"
			:delete-button-label="properties.deleteButtonLabel"
			:manage-on-meta-button-label="properties.manageOnMetaButtonLabel"
			:row-actions-menu-aria-label="properties.rowActionsMenuAriaLabel"
			:show-manage-on-meta="properties.showManageOnMeta"
			:reveal-secret-aria-label="properties.revealSecretAriaLabel"
			:hide-secret-aria-label="properties.hideSecretAriaLabel"
			:copy-secret-aria-label="properties.copySecretAriaLabel"
			:token-secret-actions-aria-label="properties.tokenSecretActionsAriaLabel"
			@delete="emit( 'delete', $event )"
			@manage-on-meta="emit( 'manage-on-meta' )"
		/>
	</ul>
</template>

<style scoped>
.account-oauth-consumer-list {
	display: flex;
	flex-direction: column;
	gap: 0;
	margin: 0;
	padding: 0;
}
</style>
