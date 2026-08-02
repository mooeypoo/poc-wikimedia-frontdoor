<script setup lang="ts">
import { CdxButton } from '@wikimedia/codex'

/**
 * Logged-out `/account` gate (Figma node 1001:18723).
 *
 * Presentational: title, prompt, progressive Log in, and a mock Create an account
 * Codex Link to Wikimedia CreateAccount. Login action is provided by the parent via
 * {@link useAccountDashboardPage} → real OAuth (`useOAuthSession.login`). Create
 * account is outbound-only (new tab); Front Door does not close or continue that flow.
 *
 * Owns viewport-height fill so the shell footer stays at the bottom — do not put
 * those styles on the logged-in dashboard container.
 */
defineProps<{
	/** Page title (banana-i18n). */
	title: string
	/** Prompt below the title (banana-i18n). */
	description: string
	/** Progressive primary button label (banana-i18n). */
	loginButtonLabel: string
	/** Plain text before the Create an account link (banana-i18n). */
	createAccountPrompt: string
	/** Codex Link label for Create an account (banana-i18n). */
	createAccountLinkLabel: string
	/** Absolute CreateAccount URL from `config/auth.ts`. */
	createAccountUrl: string
	/** Accessible name for the Create an account link (includes “opens in a new tab”). */
	createAccountLinkAriaLabel: string
}>()

const emit = defineEmits<{
	login: []
}>()

/**
 * Forwards the Log in button click to the parent (starts Meta OAuth + PKCE).
 *
 * @returns Nothing.
 */
function onLogin(): void {
	emit( 'login' )
}
</script>

<template>
	<div class="account-logged-out">
		<header class="account-logged-out__header">
			<h1 class="account-logged-out__title">
				{{ title }}
			</h1>
			<p class="account-logged-out__description">
				{{ description }}
			</p>
		</header>

		<CdxButton
			action="progressive"
			weight="primary"
			@click="onLogin"
		>
			{{ loginButtonLabel }}
		</CdxButton>

		<!--
			Create an account: Codex Link via shell `.frontdoor-shell__main a`
			(--color-link* mixin). Mock outbound only — no post-registration return.
			Visited colour suppressed (same product choice as platform-home links).
		-->
		<p class="account-logged-out__create-account">
			{{ createAccountPrompt }} <a
				class="account-logged-out__create-account-link"
				:href="createAccountUrl"
				target="_blank"
				rel="noopener noreferrer"
				:aria-label="createAccountLinkAriaLabel"
			>{{ createAccountLinkLabel }}</a>
		</p>
	</div>
</template>

<style scoped>
.account-logged-out {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	/* Figma 1001:18723 — title / body / button / create-account stack uses --spacing-200. */
	gap: var( --spacing-200 );
	/*
	 * Fill the main column so the shell footer stays at the viewport bottom.
	 * Logged-in dashboard must not share this — it collapses section gaps.
	 */
	flex: 1 1 auto;
	min-block-size: 100%;
	box-sizing: border-box;
}

.account-logged-out__header {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-200 );
	max-inline-size: var( --size-4000 );
}

.account-logged-out__title {
	margin-block: 0;
	margin-inline: 0;
	font-family: var( --font-family-heading-main, var( --font-family-serif ) );
	font-size: var( --font-size-xxx-large );
	font-weight: var( --font-weight-normal );
	line-height: var( --line-height-xxx-large );
}

.account-logged-out__description {
	margin-block: 0;
	margin-inline: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-medium );
}

.account-logged-out__create-account {
	margin-block: 0;
	margin-inline: 0;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-medium );
}

/*
 * Never show visited colour on Create an account (mock outbound link).
 * Outranks shell `.frontdoor-shell__main :where(a:visited)` (zero specificity).
 */
.account-logged-out__create-account-link:visited {
	color: var( --color-link );
}

.account-logged-out__create-account-link:visited:hover {
	color: var( --color-link--hover );
}

.account-logged-out__create-account-link:visited:active {
	color: var( --color-link--active );
}
</style>
