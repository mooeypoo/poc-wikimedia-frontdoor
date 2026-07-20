import { defineStore } from 'pinia'
import type { PrototypeDeveloperJwt, PrototypeOAuthConsumer } from '../config/tokenManagement'
import {
	createPrototypeClientSecret,
	createPrototypeRefreshToken,
	PROTOTYPE_SEED_DEVELOPER_JWTS,
	PROTOTYPE_SEED_OAUTH_CONSUMERS
} from '../config/tokenManagement'

/**
 * In-memory prototype token lists for the account dashboard.
 *
 * Experiment 2 will load real tokens from Wikimedia's Meta-Wiki via `useOAuthSession()`; this store
 * is UI-prototype only. Delete removes rows; Reset confirm calls `regenerateDeveloperJwt` /
 * `regenerateOAuthConsumer` to mint new prototype secrets and issued dates in place.
 */
export const usePrototypeDeveloperTokensStore = defineStore( 'prototypeDeveloperTokens', () => {
	const developerJwts = ref<PrototypeDeveloperJwt[]>( [ ...PROTOTYPE_SEED_DEVELOPER_JWTS ] )
	const oauthConsumers = ref<PrototypeOAuthConsumer[]>( [ ...PROTOTYPE_SEED_OAUTH_CONSUMERS ] )

	/**
	 * Removes a developer JWT row from the prototype list.
	 *
	 * @param tokenId - Row identifier from {@link PrototypeDeveloperJwt.id}.
	 * @returns Nothing.
	 */
	function removeDeveloperJwt( tokenId: string ): void {
		developerJwts.value = developerJwts.value.filter( ( token ) => token.id !== tokenId )
	}

	/**
	 * Removes an OAuth consumer row from the prototype list.
	 *
	 * @param consumerId - Row identifier from {@link PrototypeOAuthConsumer.id}.
	 * @returns Nothing.
	 */
	function removeOAuthConsumer( consumerId: string ): void {
		oauthConsumers.value = oauthConsumers.value.filter( ( consumer ) => consumer.id !== consumerId )
	}

	/**
	 * Regenerates a personal API key’s prototype secrets and issued date (Reset confirm).
	 *
	 * Client ID (`consumerKey`) is preserved. Client secret, refresh token, and access token
	 * are replaced with new prototype values for the Reset success dialog (Figma 633:7695).
	 *
	 * @param tokenId - Row identifier from {@link PrototypeDeveloperJwt.id}.
	 * @returns The updated row, or `null` if the id was not found.
	 */
	function regenerateDeveloperJwt( tokenId: string ): PrototypeDeveloperJwt | null {
		const issuedOn = new Date().toISOString().slice( 0, 10 )
		let updatedToken: PrototypeDeveloperJwt | null = null

		developerJwts.value = developerJwts.value.map( ( token ) => {
			if ( token.id !== tokenId ) {
				return token
			}

			updatedToken = {
				...token,
				clientSecret: createPrototypeClientSecret(),
				refreshToken: createPrototypeRefreshToken(),
				accessToken: `eyJprototype.reset.${ tokenId }.${ Date.now() }`,
				issuedOn
			}

			return updatedToken
		} )

		return updatedToken
	}

	/**
	 * Regenerates an application API key’s prototype client secret, refresh token, and issued date.
	 *
	 * Client ID (`consumerKey`) is preserved. New secret/refresh values are shown in the
	 * Reset success dialog (Figma 633:7695).
	 *
	 * @param consumerId - Row identifier from {@link PrototypeOAuthConsumer.id}.
	 * @returns The updated row, or `null` if the id was not found.
	 */
	function regenerateOAuthConsumer( consumerId: string ): PrototypeOAuthConsumer | null {
		const registeredOn = new Date().toISOString().slice( 0, 10 )
		let updatedConsumer: PrototypeOAuthConsumer | null = null

		oauthConsumers.value = oauthConsumers.value.map( ( consumer ) => {
			if ( consumer.id !== consumerId ) {
				return consumer
			}

			updatedConsumer = {
				...consumer,
				clientSecret: createPrototypeClientSecret(),
				refreshToken: createPrototypeRefreshToken(),
				registeredOn
			}

			return updatedConsumer
		} )

		return updatedConsumer
	}

	/**
	 * Restores seed rows after sign-in or for demos.
	 *
	 * @returns Nothing.
	 */
	function resetToSeedData(): void {
		developerJwts.value = [ ...PROTOTYPE_SEED_DEVELOPER_JWTS ]
		oauthConsumers.value = [ ...PROTOTYPE_SEED_OAUTH_CONSUMERS ]
	}

	return {
		developerJwts,
		oauthConsumers,
		removeDeveloperJwt,
		removeOAuthConsumer,
		regenerateDeveloperJwt,
		regenerateOAuthConsumer,
		resetToSeedData
	}
} )
