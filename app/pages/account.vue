<script setup lang="ts">
import { CdxButton, CdxMessage } from '@wikimedia/codex'
import AccountDeveloperTokenList from '../components/account/AccountDeveloperTokenList.vue'
import AccountExternalMetaLink from '../components/account/AccountExternalMetaLink.vue'
import AccountOAuthConsumerList from '../components/account/AccountOAuthConsumerList.vue'
import AccountResetApiKeyDialog from '../components/account/AccountResetApiKeyDialog.vue'

/**
 * Developer account dashboard — personal and application API keys (Figma `/account`).
 *
 * Labels and list data: {@link useAccountDashboardPage}.
 */
const {
	username,
	initializePrototypeAccountSession,
	resetPrototypeAccountSession,
	hasDeveloperJwts,
	hasOAuthConsumers,
	ownerOnlyConsumersDocUrl,
	oauthForDevelopersDocUrl,
	developerJwtListItems,
	oauthConsumerListItems,
	issuedMetaPrefix,
	statusMetaPrefix,
	permissionsMetaPrefix,
	clientIdLabel,
	clientSecretLabel,
	onDeleteDeveloperJwt,
	onDeleteOAuthConsumer,
	onRequestNewAuthenticationToken,
	isResetDialogOpen,
	isResetDialogSuccessStep,
	resetDialogTitle,
	resetDialogBody,
	resetDialogSuccessIntro,
	resetDialogWarning,
	resetDialogCloseLabel,
	resetDialogCopyAriaLabel,
	resetDialogCopiedTooltipLabel,
	resetDialogCredentialsListAriaLabel,
	resetDialogPrimaryAction,
	resetDialogDefaultAction,
	revealedCredentialRows,
	openResetPersonalApiKeyDialog,
	openResetApplicationApiKeyDialog,
	closeResetApiKeyDialog,
	onResetDialogPrimaryAction,
	pageTitleBefore,
	pageTitleAfter,
	developerTokensSectionTitle,
	developerTokensDescription,
	oauthTokensSectionTitle,
	oauthTokensDescription,
	requestNewTokenLabel,
	developerJwtEmptyMessage,
	oauthConsumersEmptyMessage,
	resetTokenLabel,
	deleteTokenLabel,
	writeTokenNotice,
	signOutButtonLabel,
	learnMoreOAuthLabel,
	learnMoreOwnerOnlyLabel,
	learnMoreOAuthAriaLabel,
	learnMoreOwnerOnlyAriaLabel,
	learnMoreAboutBefore,
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
			aria-labelledby="account-personal-keys-heading"
		>
			<div class="account-page__section-intro">
				<h2
					id="account-personal-keys-heading"
					class="account-page__section-heading"
				>
					{{ developerTokensSectionTitle }}
				</h2>
				<p class="account-page__prose account-page__section-description">
					{{ developerTokensDescription }}
				</p>
			</div>

			<AccountDeveloperTokenList
				v-if="hasDeveloperJwts"
				:list-aria-label="developerJwtListAriaLabel"
				:items="developerJwtListItems"
				:issued-meta-prefix="issuedMetaPrefix"
				:status-meta-prefix="statusMetaPrefix"
				:permissions-meta-prefix="permissionsMetaPrefix"
				:reset-button-label="resetTokenLabel"
				:delete-button-label="deleteTokenLabel"
				@reset="openResetPersonalApiKeyDialog"
				@delete="onDeleteDeveloperJwt"
			/>
			<CdxMessage
				v-else
				type="notice"
			>
				{{ developerJwtEmptyMessage }}
			</CdxMessage>

			<p class="account-page__learn-more">
				{{ learnMoreAboutBefore }}
				<AccountExternalMetaLink
					:href="ownerOnlyConsumersDocUrl"
					:accessible-label="learnMoreOwnerOnlyAriaLabel"
				>
					{{ learnMoreOwnerOnlyLabel }}
				</AccountExternalMetaLink>
			</p>
		</section>

		<section
			class="account-page__section"
			aria-labelledby="account-application-keys-heading"
		>
			<div class="account-page__section-intro">
				<h2
					id="account-application-keys-heading"
					class="account-page__section-heading"
				>
					{{ oauthTokensSectionTitle }}
				</h2>
				<p class="account-page__prose account-page__section-description">
					{{ oauthTokensDescription }}
				</p>
				<p class="account-page__learn-more">
					{{ learnMoreAboutBefore }}
					<AccountExternalMetaLink
						:href="oauthForDevelopersDocUrl"
						:accessible-label="learnMoreOAuthAriaLabel"
					>
						{{ learnMoreOAuthLabel }}
					</AccountExternalMetaLink>
				</p>
			</div>

			<AccountOAuthConsumerList
				v-if="hasOAuthConsumers"
				:list-aria-label="oauthConsumersListAriaLabel"
				:items="oauthConsumerListItems"
				:client-id-label="clientIdLabel"
				:client-secret-label="clientSecretLabel"
				:issued-meta-prefix="issuedMetaPrefix"
				:status-meta-prefix="statusMetaPrefix"
				:permissions-meta-prefix="permissionsMetaPrefix"
				:reset-button-label="resetTokenLabel"
				:delete-button-label="deleteTokenLabel"
				:write-token-notice="writeTokenNotice"
				@reset="openResetApplicationApiKeyDialog"
				@delete="onDeleteOAuthConsumer"
			/>
			<CdxMessage
				v-else
				type="notice"
			>
				{{ oauthConsumersEmptyMessage }}
			</CdxMessage>
		</section>

		<div class="account-page__request">
			<CdxButton
				action="progressive"
				weight="normal"
				@click="onRequestNewAuthenticationToken"
			>
				{{ requestNewTokenLabel }}
			</CdxButton>
		</div>

		<footer class="account-page__footer">
			<CdxButton
				action="destructive"
				weight="normal"
				@click="resetPrototypeAccountSession"
			>
				{{ signOutButtonLabel }}
			</CdxButton>
		</footer>

		<AccountResetApiKeyDialog
			v-model:open="isResetDialogOpen"
			:is-success-step="isResetDialogSuccessStep"
			:title="resetDialogTitle"
			:body="resetDialogBody"
			:success-intro="resetDialogSuccessIntro"
			:warning="resetDialogWarning"
			:credential-rows="revealedCredentialRows"
			:credentials-list-aria-label="resetDialogCredentialsListAriaLabel"
			:copy-aria-label="resetDialogCopyAriaLabel"
			:copied-tooltip-label="resetDialogCopiedTooltipLabel"
			:close-button-label="resetDialogCloseLabel"
			:primary-action="resetDialogPrimaryAction"
			:default-action="resetDialogDefaultAction"
			@primary="onResetDialogPrimaryAction"
			@cancel="closeResetApiKeyDialog"
		/>
	</div>
</template>

<style scoped>
.account-page {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-200 );
	max-inline-size: 57rem;
}

.account-page__prose {
	max-inline-size: var( --size-4000 );
}

.account-page__header {
	padding-block-end: 0;
}

.account-page__title {
	margin: 0;
	font-family: var( --font-family-heading-main, var( --font-family-serif ) );
	font-size: var( --font-size-xxx-large );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-xxx-large );
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
	display: flex;
	flex-direction: column;
	gap: var( --spacing-150 );
	padding-block-end: 0;
}

.account-page__section-intro {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-75 );
}

.account-page__section-heading {
	margin: 0;
	font-family: var( --font-family-heading-main, var( --font-family-serif ) );
	font-size: var( --font-size-xx-large );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-xx-large );
}

.account-page__section-description {
	margin: 0;
}

.account-page__learn-more {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var( --spacing-50 );
	margin: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-medium );
}

.account-page__request {
	display: flex;
	flex-wrap: wrap;
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
