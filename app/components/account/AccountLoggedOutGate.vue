<script setup lang="ts">
import { CdxButton } from '@wikimedia/codex'

/**
 * Logged-out `/account` gate (Figma node 1001:18723).
 *
 * Presentational: title, prompt, and progressive Log in. Login action is provided
 * by the parent via {@link useAccountDashboardPage} → real OAuth (`useOAuthSession.login`).
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
	</div>
</template>

<style scoped>
.account-logged-out {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	/* Figma 1001:18723 — title / body / button stack uses --spacing-200. */
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
</style>
