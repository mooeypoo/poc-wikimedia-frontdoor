<script setup lang="ts">
import { CdxMessage, CdxProgressBar } from '@wikimedia/codex'
import { OAUTH_HANDOFF_STORAGE_KEY } from '../../utils/oauthHandoff'

/**
 * OAuth callback landing page (docs/adr-wikimedia-oauth-authentication.md
 * §10 Step B4).
 *
 * Meta redirects here with ?code=…&state=… after the user authorizes. The
 * exchange must run client-side so the resulting access token can be handed
 * off to the destination page (ADR §5.4).
 *
 * The destination is reached via `window.location.replace` rather than
 * `router.replace` so the explorer route boundary plugin can force the clean
 * remount Scalar needs. The token is stashed in sessionStorage across that
 * single navigation and read+cleared on the other side by the oauth-handoff
 * plugin — the token is in storage only during that handoff moment.
 */

interface ExchangeResponse {
	accessToken: string
	expiresAt: number
	username: string
	returnTo: string
}

const route = useRoute()
const { $bananaI18n } = useNuxtApp()

const hasError = ref( false )

const completingLabel = computed( () => $bananaI18n( 'oauth-callback-completing-label' ) )
const errorLabel = computed( () => $bananaI18n( 'oauth-callback-error-label' ) )

onMounted( async () => {
	const code = typeof route.query.code === 'string' ? route.query.code : ''
	const state = typeof route.query.state === 'string' ? route.query.state : ''

	if ( !code || !state ) {
		hasError.value = true
		return
	}

	try {
		const response = await $fetch<ExchangeResponse>( '/api/auth/oauth/exchange', {
			method: 'POST',
			body: { code, state }
		} )

		sessionStorage.setItem( OAUTH_HANDOFF_STORAGE_KEY, JSON.stringify( {
			username: response.username,
			accessToken: response.accessToken,
			expiresAt: response.expiresAt
		} ) )

		// replace() (not assign()) keeps the callback URL, with its single-use
		// code, out of the browser history.
		window.location.replace( response.returnTo )
	} catch {
		hasError.value = true
	}
} )
</script>

<template>
	<div class="oauth-callback">
		<CdxMessage
			v-if="hasError"
			type="error"
		>
			{{ errorLabel }}
		</CdxMessage>
		<template v-else>
			<p class="oauth-callback__label">
				{{ completingLabel }}
			</p>
			<CdxProgressBar :aria-label="completingLabel" />
		</template>
	</div>
</template>

<style scoped>
.oauth-callback {
	max-inline-size: 32rem;
	margin-inline: auto;
	padding-block: var( --spacing-200 );
	padding-inline: var( --spacing-100 );
}

.oauth-callback__label {
	margin-block-end: var( --spacing-100 );
}
</style>
