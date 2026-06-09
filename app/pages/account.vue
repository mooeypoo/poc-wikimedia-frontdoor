<script setup lang="ts">
import { CdxButton, CdxMessage } from '@wikimedia/codex'
import AccountDeveloperTokenList from '../components/account/AccountDeveloperTokenList.vue'
import AccountExternalMetaLink from '../components/account/AccountExternalMetaLink.vue'
import AccountOAuthConsumerList from '../components/account/AccountOAuthConsumerList.vue'

/**
 * Developer account dashboard — prototype token management for community APIs.
 *
 * Labels and list data: {@link useAccountDashboardPage}; Meta-Wiki URLs and actions via
 * {@link useDeveloperTokenDashboard} (spread at composable root for template reactivity).
 */
const {
	username,
	initializePrototypeAccountSession,
	resetPrototypeAccountSession,
	hasDeveloperJwts,
	hasOAuthConsumers,
	requestDeveloperJwtUrl,
	requestOAuthApplicationUrl,
	oauthForDevelopersDocUrl,
	ownerOnlyConsumersDocUrl,
	developerJwtListItems,
	oauthConsumerListItems,
	issuedMetaPrefix,
	lastUsedMetaPrefix,
	registeredMetaPrefix,
	grantsMetaPrefix,
	neverUsedLabel,
	revealSecretAriaLabel,
	hideSecretAriaLabel,
	copySecretAriaLabel,
	tokenSecretActionsAriaLabel,
	onDeleteDeveloperJwt,
	onDeleteOAuthConsumer,
	onOpenManageConsumersOnMeta,
	pageTitleBefore,
	pageTitleAfter,
	developerTokensSectionTitle,
	developerTokensDescription,
	oauthTokensSectionTitle,
	oauthTokensDescription,
	requestDeveloperTokenGuidance,
	requestOAuthApplicationGuidance,
	requestDeveloperTokenLabel,
	requestOAuthApplicationLabel,
	requestDeveloperTokenAriaLabel,
	requestOAuthApplicationAriaLabel,
	developerJwtEmptyMessage,
	oauthConsumersEmptyMessage,
	deleteTokenLabel,
	adjustScopeLabel,
	rowActionsMenuAriaLabel,
	signOutButtonLabel,
	learnMoreOAuthLabel,
	learnMoreOwnerOnlyLabel,
	learnMoreOAuthAriaLabel,
	learnMoreOwnerOnlyAriaLabel,
	developerTokensHelpBefore,
	developerTokensHelpAfter,
	oauthTokensHelpBefore,
	oauthTokensHelpAfter,
	developerJwtListAriaLabel,
	oauthConsumersListAriaLabel
} = useAccountDashboardPage()

onMounted( () => {
	initializePrototypeAccountSession()
} )
</script>

<template>
	<div class="account-page">
		<header class="account-page__header">
			<h1 class="account-page__title">
				<span
					v-if="pageTitleBefore"
					:class="{ 'account-page__title-before': pageTitleAfter }"
				>{{ pageTitleBefore }}</span><bdi>{{ username }}</bdi><span v-if="pageTitleAfter">{{ pageTitleAfter }}</span>
			</h1>
		</header>

		<section
			class="account-page__section"
			aria-labelledby="account-developer-tokens-heading"
		>
			<h2
				id="account-developer-tokens-heading"
				class="account-page__section-heading"
			>
				{{ developerTokensSectionTitle }}
			</h2>
			<p class="account-page__prose account-page__section-description">
				{{ developerTokensDescription }}
			</p>

			<AccountDeveloperTokenList
				v-if="hasDeveloperJwts"
				:list-aria-label="developerJwtListAriaLabel"
				:items="developerJwtListItems"
				:issued-meta-prefix="issuedMetaPrefix"
				:last-used-meta-prefix="lastUsedMetaPrefix"
				:never-used-label="neverUsedLabel"
				:delete-button-label="deleteTokenLabel"
				:reveal-secret-aria-label="revealSecretAriaLabel"
				:hide-secret-aria-label="hideSecretAriaLabel"
				:copy-secret-aria-label="copySecretAriaLabel"
				:token-secret-actions-aria-label="tokenSecretActionsAriaLabel"
				@delete="onDeleteDeveloperJwt"
			/>
			<CdxMessage
				v-else
				type="notice"
			>
				{{ developerJwtEmptyMessage }}
			</CdxMessage>

			<div class="account-page__section-request">
				<p class="account-page__section-action">
					<AccountExternalMetaLink
						:href="requestDeveloperJwtUrl"
						:accessible-label="requestDeveloperTokenAriaLabel"
					>
						{{ requestDeveloperTokenLabel }}
					</AccountExternalMetaLink>
				</p>
				<p class="account-page__prose account-page__request-guidance account-page__request-guidance--subtle">
					{{ requestDeveloperTokenGuidance }}
					<br>
					{{ developerTokensHelpBefore }}
					<AccountExternalMetaLink
						:href="ownerOnlyConsumersDocUrl"
						:accessible-label="learnMoreOwnerOnlyAriaLabel"
					>
						{{ learnMoreOwnerOnlyLabel }}
					</AccountExternalMetaLink>{{ developerTokensHelpAfter }}
				</p>
			</div>
		</section>

		<section
			class="account-page__section"
			aria-labelledby="account-oauth-tokens-heading"
		>
			<h2
				id="account-oauth-tokens-heading"
				class="account-page__section-heading"
			>
				{{ oauthTokensSectionTitle }}
			</h2>
			<p class="account-page__prose account-page__section-description">
				{{ oauthTokensDescription }}
			</p>

			<AccountOAuthConsumerList
				v-if="hasOAuthConsumers"
				:list-aria-label="oauthConsumersListAriaLabel"
				:items="oauthConsumerListItems"
				:registered-meta-prefix="registeredMetaPrefix"
				:grants-meta-prefix="grantsMetaPrefix"
				:delete-button-label="deleteTokenLabel"
				:manage-on-meta-button-label="adjustScopeLabel"
				:row-actions-menu-aria-label="rowActionsMenuAriaLabel"
				:show-manage-on-meta="true"
				:reveal-secret-aria-label="revealSecretAriaLabel"
				:hide-secret-aria-label="hideSecretAriaLabel"
				:copy-secret-aria-label="copySecretAriaLabel"
				:token-secret-actions-aria-label="tokenSecretActionsAriaLabel"
				@delete="onDeleteOAuthConsumer"
				@manage-on-meta="onOpenManageConsumersOnMeta"
			/>
			<CdxMessage
				v-else
				type="notice"
			>
				{{ oauthConsumersEmptyMessage }}
			</CdxMessage>

			<div class="account-page__section-request">
				<p class="account-page__section-action">
					<AccountExternalMetaLink
						:href="requestOAuthApplicationUrl"
						:accessible-label="requestOAuthApplicationAriaLabel"
					>
						{{ requestOAuthApplicationLabel }}
					</AccountExternalMetaLink>
				</p>
				<p class="account-page__prose account-page__request-guidance account-page__request-guidance--subtle">
					{{ requestOAuthApplicationGuidance }}
					<br>
					{{ oauthTokensHelpBefore }}
					<AccountExternalMetaLink
						:href="oauthForDevelopersDocUrl"
						:accessible-label="learnMoreOAuthAriaLabel"
					>
						{{ learnMoreOAuthLabel }}
					</AccountExternalMetaLink>{{ oauthTokensHelpAfter }}
				</p>
			</div>
		</section>

		<footer class="account-page__footer">
			<CdxButton
				action="destructive"
				weight="normal"
				@click="resetPrototypeAccountSession"
			>
				{{ signOutButtonLabel }}
			</CdxButton>
		</footer>
	</div>
</template>

<style scoped>
.account-page__prose {
	max-inline-size: var( --size-4000 );
}

.account-page__header {
	padding-block-end: var( --spacing-200 );
}

.account-page__title {
	margin: 0;
}

/*
 * English uses an empty before + suffix after; when after is set, hide before for AT only.
 * Locales with a visible prefix (fr, he, …) keep before unstyled.
 */
.account-page__title-before {
	position: absolute;
	inline-size: 1px;
	block-size: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect( 0, 0, 0, 0 );
	white-space: nowrap;
	border: 0;
}

.account-page__section {
	padding-block-end: var( --spacing-200 );
}

.account-page__section-heading {
	margin-block: 0 var( --spacing-100 );
	margin-inline: 0;
	font-size: var( --font-size-x-large );
	font-weight: var( --font-weight-bold );
}

.account-page__section-description {
	margin-block: 0 var( --spacing-100 );
	margin-inline: 0;
}

.account-page__section-request {
	margin-block: var( --spacing-100 ) 0;
	margin-inline: 0;
}

.account-page__section-action {
	margin-block: 0;
	margin-inline: 0;
}

.account-page__request-guidance {
	margin-block: var( --spacing-75 ) 0;
	margin-inline: 0;
	font-size: var( --font-size-medium );
}

.account-page__request-guidance--subtle {
	color: var( --color-subtle );
}

.account-page__footer {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-start;
	gap: var( --spacing-75 );
	padding-block-start: var( --spacing-150 );
	border-block-start: 1px solid var( --border-color-subtle );
}
</style>
