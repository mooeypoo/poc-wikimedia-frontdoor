import {
	MEDIAWIKI_OAUTH_FOR_DEVELOPERS_DOC_URL,
	MEDIAWIKI_OWNER_ONLY_CONSUMERS_DOC_URL,
	MEDIAWIKI_WIKIMEDIA_API_AUTHENTICATION_DOC_URL,
	META_OAUTH2_CONSUMER_REGISTRATION_URL,
	META_OAUTH_CONSUMER_LIST_URL
} from '../../config/auth'
import type { PrototypeDeveloperJwt, PrototypeOAuthConsumer } from '../../config/tokenManagement'
import { storeToRefs } from 'pinia'
import { usePrototypeDeveloperTokensStore } from '../../stores/prototypeDeveloperTokens'
import { openUrlInNewTab } from '../utils/openUrlInNewTab'
import { maskSecretValue } from '../utils/accountTokenSecret'
import type {
	AccountDeveloperTokenListItem,
	AccountOAuthConsumerListItem
} from '../types/accountTokenList'

/**
 * Wikimedia Meta-Wiki links, token list state, and list view-models for the account dashboard.
 *
 * Wraps `prototypeDeveloperTokens` Pinia store; URLs come from `config/auth.ts`.
 * Masked secrets are computed here (`maskSecretValue`) so list-item components stay presentational.
 *
 * @returns {{
 *   hasDeveloperJwts: import('vue').ComputedRef<boolean>,
 *   hasOAuthConsumers: import('vue').ComputedRef<boolean>,
 *   developerJwtListItems: import('vue').ComputedRef<import('../types/accountTokenList').AccountDeveloperTokenListItem[]>,
 *   oauthConsumerListItems: import('vue').ComputedRef<import('../types/accountTokenList').AccountOAuthConsumerListItem[]>,
 *   issuedMetaPrefix: import('vue').ComputedRef<string>,
 *   statusMetaPrefix: import('vue').ComputedRef<string>,
 *   permissionsMetaPrefix: import('vue').ComputedRef<string>,
 *   clientIdLabel: import('vue').ComputedRef<string>,
 *   clientSecretLabel: import('vue').ComputedRef<string>,
 *   onDeleteDeveloperJwt: (tokenId: string) => void,
 *   onDeleteOAuthConsumer: (consumerId: string) => void,
 *   onConfirmResetDeveloperJwt: (tokenId: string) => import('../../config/tokenManagement').PrototypeDeveloperJwt | null,
 *   onConfirmResetOAuthConsumer: (consumerId: string) => import('../../config/tokenManagement').PrototypeOAuthConsumer | null,
 *   onRequestNewAuthenticationToken: () => void,
 *   externalLinkAccessibleLabel: (linkLabel: string) => string
 * }} Reactive lists, Meta-Wiki/MediaWiki doc URLs, metadata labels, delete/request
 *   handlers, and confirm-reset regenerate handlers (used by {@link useAccountResetApiKeyDialog}).
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
	const statusMetaPrefix = computed( () => $bananaI18n( 'account-meta-status' ) )
	const permissionsMetaPrefix = computed( () => $bananaI18n( 'account-meta-permissions' ) )
	const clientIdLabel = computed( () => $bananaI18n( 'account-client-id-label' ) )
	const clientSecretLabel = computed( () => $bananaI18n( 'account-client-secret-label' ) )

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
			issuedOn: token.issuedOn,
			status: token.status,
			permissions: token.permissions
		} ) )
	)

	const oauthConsumerListItems = computed( (): AccountOAuthConsumerListItem[] =>
		oauthConsumers.value.map( ( consumer ) => ( {
			id: consumer.id,
			applicationName: consumer.applicationName,
			description: consumer.description,
			consumerKey: consumer.consumerKey,
			clientSecret: consumer.clientSecret,
			maskedClientSecret: maskSecretValue( consumer.clientSecret ),
			status: consumer.status,
			permissions: consumer.permissions,
			registeredOn: consumer.registeredOn
		} ) )
	)

	/**
	 * Removes a personal API key from the prototype list.
	 *
	 * @param tokenId - Token row id.
	 * @returns Nothing.
	 */
	function onDeleteDeveloperJwt( tokenId: string ): void {
		prototypeDeveloperTokensStore.removeDeveloperJwt( tokenId )
	}

	/**
	 * Removes an application OAuth key from the prototype list.
	 *
	 * @param consumerId - Consumer row id.
	 * @returns Nothing.
	 */
	function onDeleteOAuthConsumer( consumerId: string ): void {
		prototypeDeveloperTokensStore.removeOAuthConsumer( consumerId )
	}

	/**
	 * Regenerates prototype credentials for a personal API key after dialog confirm.
	 *
	 * @param tokenId - Token row id.
	 * @returns The updated personal key row, or `null` if not found.
	 */
	function onConfirmResetDeveloperJwt( tokenId: string ): PrototypeDeveloperJwt | null {
		return prototypeDeveloperTokensStore.regenerateDeveloperJwt( tokenId )
	}

	/**
	 * Regenerates prototype credentials for an application API key after dialog confirm.
	 *
	 * @param consumerId - Consumer row id.
	 * @returns The updated application key row, or `null` if not found.
	 */
	function onConfirmResetOAuthConsumer( consumerId: string ): PrototypeOAuthConsumer | null {
		return prototypeDeveloperTokensStore.regenerateOAuthConsumer( consumerId )
	}

	/**
	 * Opens Meta-Wiki OAuth consumer registration to request a new authentication token.
	 *
	 * @returns Nothing.
	 */
	function onRequestNewAuthenticationToken(): void {
		openUrlInNewTab( requestOAuthApplicationUrl )
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
		statusMetaPrefix,
		permissionsMetaPrefix,
		clientIdLabel,
		clientSecretLabel,
		externalLinkAccessibleLabel,
		onDeleteDeveloperJwt,
		onDeleteOAuthConsumer,
		onConfirmResetDeveloperJwt,
		onConfirmResetOAuthConsumer,
		onRequestNewAuthenticationToken
	}
}
