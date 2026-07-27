<script setup lang="ts">
import { CdxButton, CdxMessage } from '@wikimedia/codex'
import AccountTokenListItemLayout from './AccountTokenListItemLayout.vue'
import type { AccountOAuthConsumerListItem } from '../../types/accountTokenList'

/**
 * Application API key list item — name, description, client id/secret, meta, write-token notice.
 *
 * Card body stacks description / credentials / meta, then a write-token `CdxMessage`
 * with Codex **`--spacing-75`** (12px) between the content block and the message
 * (`.account-oauth-consumer-list-item__stack`).
 */
const properties = defineProps<{
	item: AccountOAuthConsumerListItem
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

/**
 * Emits reset for this application key.
 *
 * @returns Nothing.
 */
function onReset(): void {
	emit( 'reset', properties.item.id )
}

/**
 * Emits delete for this application key.
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
			<h3 class="account-oauth-consumer-list-item__title">
				<bdi>{{ properties.item.applicationName }}</bdi>
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

		<div class="account-oauth-consumer-list-item__stack">
			<div class="account-oauth-consumer-list-item__content">
				<p class="account-oauth-consumer-list-item__description">
					<bdi>{{ properties.item.description }}</bdi>
				</p>

				<div class="account-oauth-consumer-list-item__credentials">
					<p class="account-oauth-consumer-list-item__credential">
						<span>{{ properties.clientIdLabel }}</span>
						<!-- LTR: OAuth client IDs are inherently left-to-right. -->
						<code
							class="account-oauth-consumer-list-item__credential-value"
							dir="ltr"
						>
							<bdi>{{ properties.item.consumerKey }}</bdi>
						</code>
					</p>
					<p class="account-oauth-consumer-list-item__credential">
						<span>{{ properties.clientSecretLabel }}</span>
						<!-- LTR: masked OAuth client secrets are inherently left-to-right. -->
						<span
							class="account-oauth-consumer-list-item__credential-masked"
							dir="ltr"
							aria-hidden="true"
						>{{ properties.item.maskedClientSecret }}</span>
					</p>
				</div>

				<div class="account-oauth-consumer-list-item__meta">
					<p class="account-oauth-consumer-list-item__meta-item">
						<span>{{ properties.issuedMetaPrefix }}</span>
						<bdi>{{ properties.item.registeredOn }}</bdi>
					</p>
					<span
						class="account-oauth-consumer-list-item__meta-divider"
						aria-hidden="true"
					/>
					<p class="account-oauth-consumer-list-item__meta-item">
						<span>{{ properties.statusMetaPrefix }}</span>
						<bdi>{{ properties.item.status }}</bdi>
					</p>
					<span
						class="account-oauth-consumer-list-item__meta-divider"
						aria-hidden="true"
					/>
					<p class="account-oauth-consumer-list-item__meta-item">
						<span>{{ properties.permissionsMetaPrefix }}</span>
						<bdi>{{ properties.item.permissions }}</bdi>
					</p>
				</div>
			</div>

			<CdxMessage
				class="account-oauth-consumer-list-item__notice"
				type="notice"
			>
				{{ properties.writeTokenNotice }}
			</CdxMessage>
		</div>
	</AccountTokenListItemLayout>
</template>

<style scoped>
/* Stack owns Spacing/75 (12px) between card content and the write-token CdxMessage. */
.account-oauth-consumer-list-item__stack {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-75 );
}

.account-oauth-consumer-list-item__content {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-50 );
}

.account-oauth-consumer-list-item__title {
	margin: 0;
	font-size: var( --font-size-medium );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-small );
}

.account-oauth-consumer-list-item__description {
	margin: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
}

.account-oauth-consumer-list-item__credentials {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-50 );
}

.account-oauth-consumer-list-item__credential {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-50 );
	margin: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
}

.account-oauth-consumer-list-item__credential-value {
	font-family: var( --font-family-monospace, monospace );
	font-size: var( --font-size-medium );
}

.account-oauth-consumer-list-item__credential-masked {
	font-family: var( --font-family-monospace, monospace );
	letter-spacing: 0.05em;
}

.account-oauth-consumer-list-item__meta {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-50 );
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

.account-oauth-consumer-list-item__meta-divider {
	inline-size: 1px;
	block-size: 1rem;
	background-color: var( --border-color-subtle );
	flex-shrink: 0;
}

.account-oauth-consumer-list-item__notice {
	inline-size: 100%;
}
</style>
