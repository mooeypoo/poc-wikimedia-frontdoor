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
 * is UI-prototype only.
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
		resetToSeedData
	}
} )
