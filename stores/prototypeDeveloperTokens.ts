import { defineStore } from 'pinia'
import type { PrototypeDeveloperJwt, PrototypeOAuthConsumer } from '../config/tokenManagement'
import {
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
	 * Regenerates a personal API key’s prototype secret and issued date (Reset confirm).
	 *
	 * @param tokenId - Row identifier from {@link PrototypeDeveloperJwt.id}.
	 * @returns Nothing.
	 */
	function regenerateDeveloperJwt( tokenId: string ): void {
		const issuedOn = new Date().toISOString().slice( 0, 10 )
		developerJwts.value = developerJwts.value.map( ( token ) => {
			if ( token.id !== tokenId ) {
				return token
			}

			return {
				...token,
				accessToken: `eyJprototype.reset.${ tokenId }.${ Date.now() }`,
				issuedOn
			}
		} )
	}

	/**
	 * Regenerates an application API key’s prototype client secret and issued date.
	 *
	 * @param consumerId - Row identifier from {@link PrototypeOAuthConsumer.id}.
	 * @returns Nothing.
	 */
	function regenerateOAuthConsumer( consumerId: string ): void {
		const registeredOn = new Date().toISOString().slice( 0, 10 )
		oauthConsumers.value = oauthConsumers.value.map( ( consumer ) => {
			if ( consumer.id !== consumerId ) {
				return consumer
			}

			return {
				...consumer,
				clientSecret: `prototype-reset-secret-${ Date.now() }`,
				registeredOn
			}
		} )
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
