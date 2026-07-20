<script setup lang="ts">
import AccountOAuthConsumerListItem from './AccountOAuthConsumerListItem.vue'
import type { AccountOAuthConsumerListItem as AccountOAuthConsumerListItemModel } from '../../types/accountTokenList'

/**
 * List of application API key cards for the account dashboard section.
 */
const properties = defineProps<{
	listAriaLabel: string
	items: AccountOAuthConsumerListItemModel[]
	clientIdLabel: string
	clientSecretLabel: string
	issuedMetaPrefix: string
	statusMetaPrefix: string
	permissionsMetaPrefix: string
	resetButtonLabel: string
	deleteButtonLabel: string
	writeTokenNotice: string
}>()

const emit = defineEmits<{
	reset: [ consumerId: string ]
	delete: [ consumerId: string ]
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
			:client-id-label="properties.clientIdLabel"
			:client-secret-label="properties.clientSecretLabel"
			:issued-meta-prefix="properties.issuedMetaPrefix"
			:status-meta-prefix="properties.statusMetaPrefix"
			:permissions-meta-prefix="properties.permissionsMetaPrefix"
			:reset-button-label="properties.resetButtonLabel"
			:delete-button-label="properties.deleteButtonLabel"
			:write-token-notice="properties.writeTokenNotice"
			@reset="emit( 'reset', $event )"
			@delete="emit( 'delete', $event )"
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
