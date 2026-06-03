<script setup lang="ts">
import { CdxButton, CdxCheckbox, CdxField, CdxTextInput } from '@wikimedia/codex'

/**
 * Prototype developer login page.
 *
 * Labels and submit flow: {@link useLoginPage}. Layout follows Codex form guidance
 * (`.agents/skills/codex-layout/SKILL.md`). Real OAuth 2.0 + PKCE is Experiment 2.
 */
const {
	username,
	password,
	keepLoggedIn,
	pageTitle,
	usernameLabel,
	passwordLabel,
	keepLoggedInLabel,
	submitButtonLabel,
	helpLinkLabel,
	forgotPasswordLinkLabel,
	noAccountPromptLabel,
	createAccountLinkLabel,
	auxiliaryLinksLabel,
	onLoginSubmit
} = useLoginPage()
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
