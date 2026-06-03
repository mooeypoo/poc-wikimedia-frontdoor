<script setup lang="ts">
import { CdxButton, CdxIcon, CdxMenuButton } from '@wikimedia/codex'
import { cdxIconEllipsis } from '@wikimedia/codex-icons'
import AccountTokenListItemLayout from './AccountTokenListItemLayout.vue'
import AccountTokenSecretCell from './AccountTokenSecretCell.vue'
import {
	buildAccountTokenRowMenuItems,
	isAccountTokenRowDeleteAction,
	isAccountTokenRowManageOnMetaAction
} from '../../utils/accountTokenRowActions'
import type { AccountOAuthConsumerListItem } from '../../types/accountTokenList'

/**
 * OAuth consumer list item — application name, masked client ID, metadata, overflow row actions.
 */
const properties = defineProps<{
	item: AccountOAuthConsumerListItem
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

const hasMultipleRowActions = computed( () => properties.showManageOnMeta )

const rowMenuItems = computed( () =>
	buildAccountTokenRowMenuItems( {
		showManageOnMeta: properties.showManageOnMeta,
		manageOnMetaLabel: properties.manageOnMetaButtonLabel,
		deleteLabel: properties.deleteButtonLabel
	} )
)

/**
 * Emits delete for this list item.
 *
 * @returns Nothing.
 */
function onDelete(): void {
	emit( 'delete', properties.item.id )
}

/**
 * Emits manage-on-Meta-Wiki for this consumer.
 *
 * @returns Nothing.
 */
function onManageOnMeta(): void {
	emit( 'manage-on-meta' )
}

/**
 * Handles overflow menu selection for this consumer row.
 *
 * @param selectedValue - Menu item value from `CdxMenuButton`.
 * @returns Nothing.
 */
function onRowMenuActionSelected( selectedValue: string | null ): void {
	if ( isAccountTokenRowDeleteAction( selectedValue ) ) {
		onDelete()
		return
	}

	if ( isAccountTokenRowManageOnMetaAction( selectedValue ) ) {
		onManageOnMeta()
	}
}
</script>

<template>
	<AccountTokenListItemLayout>
		<h3 class="account-oauth-consumer-list-item__title">
			<bdi>{{ properties.item.applicationName }}</bdi>
		</h3>

		<div class="account-oauth-consumer-list-item__secret-row">
			<AccountTokenSecretCell
				:secret-value="properties.item.consumerKey"
				:reveal-secret-aria-label="properties.revealSecretAriaLabel"
				:hide-secret-aria-label="properties.hideSecretAriaLabel"
				:copy-secret-aria-label="properties.copySecretAriaLabel"
				:token-secret-actions-aria-label="properties.tokenSecretActionsAriaLabel"
			/>
		</div>

		<div class="account-oauth-consumer-list-item__meta">
			<p class="account-oauth-consumer-list-item__meta-item">
				<span>{{ properties.registeredMetaPrefix }}</span>
				<bdi>{{ properties.item.registeredOn }}</bdi>
			</p>
			<p
				class="account-oauth-consumer-list-item__meta-item account-oauth-consumer-list-item__meta-item--grants"
				:title="properties.item.grantSummary"
			>
				<span>{{ properties.grantsMetaPrefix }}</span>
				<bdi>{{ properties.item.grantSummary }}</bdi>
			</p>
		</div>

		<template #actions>
			<CdxMenuButton
				v-if="hasMultipleRowActions"
				:menu-items="rowMenuItems"
				:aria-label="properties.rowActionsMenuAriaLabel"
				@update:selected="onRowMenuActionSelected"
			>
				<CdxIcon :icon="cdxIconEllipsis" />
			</CdxMenuButton>
			<CdxButton
				v-else
				action="destructive"
				weight="quiet"
				@click="onDelete"
			>
				{{ properties.deleteButtonLabel }}
			</CdxButton>
		</template>
	</AccountTokenListItemLayout>
</template>

<style scoped>
.account-oauth-consumer-list-item__title {
	margin: 0;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-small );
}

.account-oauth-consumer-list-item__secret-row {
	padding-block: var( --spacing-25 );
}

.account-oauth-consumer-list-item__meta {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-100 );
	margin: 0;
	font-size: var( --font-size-small );
	line-height: var( --line-height-small );
	color: var( --color-subtle );
}

.account-oauth-consumer-list-item__meta-item {
	display: inline-flex;
	flex-wrap: wrap;
	gap: var( --spacing-25 );
	margin: 0;
}

.account-oauth-consumer-list-item__meta-item--grants {
	flex-wrap: nowrap;
	flex: 1 1 auto;
	min-inline-size: 0;
	max-inline-size: 100%;
	overflow: hidden;
	white-space: nowrap;
}

.account-oauth-consumer-list-item__meta-item--grants > span {
	flex-shrink: 0;
}

.account-oauth-consumer-list-item__meta-item--grants > bdi {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	min-inline-size: 0;
}
</style>
