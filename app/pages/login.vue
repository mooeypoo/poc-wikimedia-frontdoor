<script setup lang="ts">
import { CdxButton, CdxCheckbox, CdxField, CdxTextInput } from '@wikimedia/codex'

/**
 * Prototype developer login page.
 *
 * Layout follows Codex constructing-forms and using-links-and-buttons guidance
 * (see `.agents/skills/codex-layout/SKILL.md`). No authentication is performed —
 * submit and auxiliary links are placeholders until Experiment 2 wires
 * Wikimedia OAuth 2.0 + PKCE.
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
		<header class="login-page__header">
			<h1 class="login-page__title">
				{{ pageTitle }}
			</h1>
		</header>

		<form
			class="login-page__form"
			@submit="onLoginSubmit"
		>
			<CdxField>
				<template #label>
					{{ usernameLabel }}
				</template>
				<CdxTextInput
					v-model="username"
					dir="auto"
					autocomplete="username"
				/>
			</CdxField>

			<CdxField>
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

			<CdxField>
				<CdxCheckbox v-model="keepLoggedIn">
					{{ keepLoggedInLabel }}
				</CdxCheckbox>
			</CdxField>

			<footer class="login-page__form-footer">
				<CdxButton
					action="progressive"
					weight="primary"
					type="submit"
				>
					{{ submitButtonLabel }}
				</CdxButton>
			</footer>
		</form>

		<nav
			class="login-page__auxiliary"
			:aria-label="auxiliaryLinksLabel"
		>
			<ul class="login-page__link-list">
				<li>
					<a
						href="#"
						@click.prevent
					>
						{{ helpLinkLabel }}
					</a>
				</li>
				<li>
					<a
						href="#"
						@click.prevent
					>
						{{ forgotPasswordLinkLabel }}
					</a>
				</li>
				<li class="login-page__link-list-item--inline">
					<span>{{ noAccountPromptLabel }}</span>
					<a
						href="#"
						@click.prevent
					>
						{{ createAccountLinkLabel }}
					</a>
				</li>
			</ul>
		</nav>
	</div>
</template>

<style scoped>
/* Codex forms: max field width size-4000; equal-width fields in one column. */
.login-page {
	max-inline-size: var( --size-4000 );
}

.login-page__header {
	margin-block-end: var( --spacing-150 );
}

.login-page__title {
	margin: 0;
}

/* spacing-100 between fields; label-to-control spacing is built into CdxField. */
.login-page__form {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-100 );
}

/* Form footer: actions at inline-start; primary submit is the sole action. */
.login-page__form-footer {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-start;
	gap: var( --spacing-75 );
}

/* spacing-150 between form block and auxiliary link group. */
.login-page__auxiliary {
	margin-block-start: var( --spacing-150 );
}

/* Vertical link group per Codex links guidance (spacing-75 between links). */
.login-page__link-list {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-75 );
	list-style: none;
	margin: 0;
	padding: 0;
}

.login-page__link-list-item--inline {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: var( --spacing-75 );
}
</style>
