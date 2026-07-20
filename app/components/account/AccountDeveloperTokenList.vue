<script setup lang="ts">
import AccountDeveloperTokenListItem from './AccountDeveloperTokenListItem.vue'
import type { AccountDeveloperTokenListItem as AccountDeveloperTokenListItemModel } from '../../types/accountTokenList'

/**
 * List of personal API key cards for the account dashboard section.
 */
const properties = defineProps<{
	listAriaLabel: string
	items: AccountDeveloperTokenListItemModel[]
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
			:status-meta-prefix="properties.statusMetaPrefix"
			:permissions-meta-prefix="properties.permissionsMetaPrefix"
			:reset-button-label="properties.resetButtonLabel"
			:delete-button-label="properties.deleteButtonLabel"
			@reset="emit( 'reset', $event )"
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
