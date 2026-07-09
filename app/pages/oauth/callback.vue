<script setup lang="ts">
import { CdxMessage, CdxProgressBar } from '@wikimedia/codex'
import { useOAuthSession } from '../../composables/useOAuthSession'

/**
 * OAuth callback landing page (docs/adr-wikimedia-oauth-authentication.md
 * §10 Step B4).
 *
 * Meta redirects here with ?code=…&state=… after the user authorizes. The
 * exchange must run client-side so the resulting access token lands in the
 * browser-memory Pinia store (ADR §5.4), hence the onMounted-only logic.
 */

interface ExchangeResponse {
	accessToken: string
	expiresAt: number
	username: string
	returnTo: string
}

const route = useRoute()
const router = useRouter()
const { setSession } = useOAuthSession()
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

		setSession( {
			username: response.username,
			accessToken: response.accessToken,
			expiresAt: response.expiresAt
		} )

		// replace() keeps the callback URL (with its single-use code) out of
		// the browser history.
		await router.replace( response.returnTo )
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
