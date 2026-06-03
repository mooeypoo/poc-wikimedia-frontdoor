<script setup lang="ts">
import { CdxButton, CdxCheckbox, CdxField, CdxTextInput } from '@wikimedia/codex'

/**
 * Prototype developer login page.
 *
 * Mirrors the Wikimedia Special:UserLogin layout using Codex form controls.
 * No authentication is performed — submit and auxiliary links are placeholders
 * until Experiment 2 wires Wikimedia OAuth 2.0 + PKCE.
 */
const { $bananaI18n } = useNuxtApp()

const username = ref( '' )
const password = ref( '' )
const keepLoggedIn = ref( false )

const pageTitle = computed( () => $bananaI18n( 'login-page-title' ) )
const usernameLabel = computed( () => $bananaI18n( 'login-username-label' ) )
const passwordLabel = computed( () => $bananaI18n( 'login-password-label' ) )
const keepLoggedInLabel = computed( () => $bananaI18n( 'login-keep-logged-in' ) )
const submitButtonLabel = computed( () => $bananaI18n( 'login-submit-button' ) )
const helpLinkLabel = computed( () => $bananaI18n( 'login-help-link' ) )
const forgotPasswordLinkLabel = computed( () => $bananaI18n( 'login-forgot-password-link' ) )
const noAccountPromptLabel = computed( () => $bananaI18n( 'login-no-account-prompt' ) )
const createAccountLinkLabel = computed( () => $bananaI18n( 'login-create-account-link' ) )
const auxiliaryLinksLabel = computed( () => $bananaI18n( 'login-page-links-label' ) )

/**
 * Handles prototype form submission — no auth backend is connected yet.
 *
 * @param submitEvent - Native form submit event.
 * @returns Nothing.
 */
function onLoginSubmit( submitEvent: Event ): void {
	submitEvent.preventDefault()
}
</script>

<template>
	<div class="login-page">
		<h1>{{ pageTitle }}</h1>

		<form
			class="login-page__form"
			@submit="onLoginSubmit"
		>
			<CdxField class="login-page__field">
				<template #label>
					{{ usernameLabel }}
				</template>
				<CdxTextInput
					v-model="username"
					dir="auto"
					autocomplete="username"
				/>
			</CdxField>

			<CdxField class="login-page__field">
				<template #label>
					{{ passwordLabel }}
				</template>
				<!-- Passwords are inherently LTR even when the interface is RTL. -->
				<CdxTextInput
					v-model="password"
					input-type="password"
					dir="ltr"
					autocomplete="current-password"
				/>
			</CdxField>

			<CdxField class="login-page__field login-page__field--checkbox">
				<CdxCheckbox v-model="keepLoggedIn">
					{{ keepLoggedInLabel }}
				</CdxCheckbox>
			</CdxField>

			<CdxButton
				class="login-page__submit"
				action="progressive"
				weight="primary"
				type="submit"
			>
				{{ submitButtonLabel }}
			</CdxButton>
		</form>

		<nav
			class="login-page__auxiliary"
			:aria-label="auxiliaryLinksLabel"
		>
			<p class="login-page__auxiliary-item">
				<a
					href="#"
					@click.prevent
				>
					{{ helpLinkLabel }}
				</a>
			</p>
			<p class="login-page__auxiliary-item">
				<a
					href="#"
					@click.prevent
				>
					{{ forgotPasswordLinkLabel }}
				</a>
			</p>
			<p class="login-page__auxiliary-item login-page__auxiliary-item--create-account">
				<span>{{ noAccountPromptLabel }}</span>
				<a
					href="#"
					@click.prevent
				>
					{{ createAccountLinkLabel }}
				</a>
			</p>
		</nav>
	</div>
</template>

<style scoped>
.login-page {
	max-inline-size: 28rem;
}

.login-page__form {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-100 );
	margin-block-start: var( --spacing-100 );
}

.login-page__field--checkbox {
	margin-block-start: 0;
}

.login-page__submit {
	align-self: flex-start;
}

.login-page__auxiliary {
	margin-block-start: var( --spacing-150 );
}

.login-page__auxiliary-item {
	margin-block: var( --spacing-50 );
}

.login-page__auxiliary-item--create-account {
	display: flex;
	flex-wrap: wrap;
	gap: var( --spacing-25 );
}
</style>
