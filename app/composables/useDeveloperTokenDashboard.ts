import {
	MEDIAWIKI_OAUTH_FOR_DEVELOPERS_DOC_URL,
	MEDIAWIKI_OWNER_ONLY_CONSUMERS_DOC_URL,
	MEDIAWIKI_WIKIMEDIA_API_AUTHENTICATION_DOC_URL,
	META_OAUTH2_CONSUMER_REGISTRATION_URL,
	META_OAUTH_CONSUMER_LIST_URL
} from '../../config/auth'
import { storeToRefs } from 'pinia'
import { usePrototypeDeveloperTokensStore } from '../../stores/prototypeDeveloperTokens'
import { openUrlInNewTab } from '../utils/openUrlInNewTab'
import type {
	AccountDeveloperTokenListItem,
	AccountOAuthConsumerListItem
} from '../types/accountTokenList'

/**
 * Wikimedia Meta-Wiki links, token list state, and list view-models for the account dashboard.
 *
 * Wraps `prototypeDeveloperTokens` Pinia store; URLs come from `config/auth.ts`.
 *
 * @returns {{
 *   hasDeveloperJwts: import('vue').ComputedRef<boolean>,
 *   hasOAuthConsumers: import('vue').ComputedRef<boolean>,
 *   developerJwtListItems: import('vue').ComputedRef<import('../types/accountTokenList').AccountDeveloperTokenListItem[]>,
 *   oauthConsumerListItems: import('vue').ComputedRef<import('../types/accountTokenList').AccountOAuthConsumerListItem[]>,
 *   issuedMetaPrefix: import('vue').ComputedRef<string>,
 *   lastUsedMetaPrefix: import('vue').ComputedRef<string>,
 *   registeredMetaPrefix: import('vue').ComputedRef<string>,
 *   grantsMetaPrefix: import('vue').ComputedRef<string>,
 *   neverUsedLabel: import('vue').ComputedRef<string>,
 *   onDeleteDeveloperJwt: (tokenId: string) => void,
 *   onDeleteOAuthConsumer: (consumerId: string) => void,
 *   onOpenManageConsumersOnMeta: () => void,
 *   externalLinkAccessibleLabel: (linkLabel: string) => string
 * }} Reactive lists, Meta-Wiki/MediaWiki doc URLs, metadata prefixes, and row action handlers.
 */
export function useDeveloperTokenDashboard() {
	const prototypeDeveloperTokensStore = usePrototypeDeveloperTokensStore()
	const { developerJwts, oauthConsumers } = storeToRefs( prototypeDeveloperTokensStore )
	const { $bananaI18n } = useNuxtApp()

	const hasDeveloperJwts = computed( () => developerJwts.value.length > 0 )
	const hasOAuthConsumers = computed( () => oauthConsumers.value.length > 0 )

	const requestDeveloperJwtUrl = META_OAUTH2_CONSUMER_REGISTRATION_URL
	const requestOAuthApplicationUrl = META_OAUTH2_CONSUMER_REGISTRATION_URL
	const manageConsumersOnMetaUrl = META_OAUTH_CONSUMER_LIST_URL

	const oauthForDevelopersDocUrl = MEDIAWIKI_OAUTH_FOR_DEVELOPERS_DOC_URL
	const ownerOnlyConsumersDocUrl = MEDIAWIKI_OWNER_ONLY_CONSUMERS_DOC_URL
	const wikimediaApiAuthenticationDocUrl = MEDIAWIKI_WIKIMEDIA_API_AUTHENTICATION_DOC_URL

	const issuedMetaPrefix = computed( () => $bananaI18n( 'account-meta-issued' ) )
	const lastUsedMetaPrefix = computed( () => $bananaI18n( 'account-meta-last-used' ) )
	const registeredMetaPrefix = computed( () => $bananaI18n( 'account-meta-registered' ) )
	const grantsMetaPrefix = computed( () => $bananaI18n( 'account-meta-grants' ) )
	const neverUsedLabel = computed( () => $bananaI18n( 'account-col-never-used' ) )

	/**
	 * Builds an accessible label for an external Meta-Wiki or MediaWiki link.
	 *
	 * @param linkLabel - Visible link text (banana-i18n).
	 * @returns Combined label for `aria-label`.
	 */
	function externalLinkAccessibleLabel( linkLabel: string ): string {
		return $bananaI18n( 'account-external-link-aria', { $1: linkLabel } )
	}

	const developerJwtListItems = computed( (): AccountDeveloperTokenListItem[] =>
		developerJwts.value.map( ( token ) => ( {
			id: token.id,
			title: token.label,
			accessToken: token.accessToken,
			issuedOn: token.issuedOn,
			lastUsedOn: token.lastUsedOn
		} ) )
	)

	const oauthConsumerListItems = computed( (): AccountOAuthConsumerListItem[] =>
		oauthConsumers.value.map( ( consumer ) => ( {
			id: consumer.id,
			applicationName: consumer.applicationName,
			consumerKey: consumer.consumerKey,
			grantSummary: consumer.grantSummary,
			registeredOn: consumer.registeredOn
		} ) )
	)

	/**
	 * Removes a developer JWT from the prototype list.
	 *
	 * @param tokenId - Token row id.
	 * @returns Nothing.
	 */
	function onDeleteDeveloperJwt( tokenId: string ): void {
		prototypeDeveloperTokensStore.removeDeveloperJwt( tokenId )
	}

	/**
	 * Removes an OAuth consumer from the prototype list.
	 *
	 * @param consumerId - Consumer row id.
	 * @returns Nothing.
	 */
	function onDeleteOAuthConsumer( consumerId: string ): void {
		prototypeDeveloperTokensStore.removeOAuthConsumer( consumerId )
	}

	/**
	 * Opens the Meta-Wiki OAuth consumer list in a new tab (adjust scope / manage).
	 *
	 * @returns Nothing.
	 */
	function onOpenManageConsumersOnMeta(): void {
		openUrlInNewTab( manageConsumersOnMetaUrl )
	}

	return {
		hasDeveloperJwts,
		hasOAuthConsumers,
		requestDeveloperJwtUrl,
		requestOAuthApplicationUrl,
		manageConsumersOnMetaUrl,
		oauthForDevelopersDocUrl,
		ownerOnlyConsumersDocUrl,
		wikimediaApiAuthenticationDocUrl,
		developerJwtListItems,
		oauthConsumerListItems,
		issuedMetaPrefix,
		lastUsedMetaPrefix,
		registeredMetaPrefix,
		grantsMetaPrefix,
		neverUsedLabel,
		externalLinkAccessibleLabel,
		onDeleteDeveloperJwt,
		onDeleteOAuthConsumer,
		onOpenManageConsumersOnMeta
	}
}
