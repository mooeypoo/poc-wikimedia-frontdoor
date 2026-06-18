<script setup lang="ts">
import {
	SITE_FOOTER_CC_BY_SA_LICENSE_URL,
	SITE_FOOTER_PRIVACY_POLICY_URL,
	SITE_FOOTER_TERMS_OF_USE_URL
} from '../../../config/siteFooter'

/**
 * ShellSiteFooter — static site footer at the end of the main content band.
 *
 * Renders inside `frontdoor-shell__content` in `default.vue` so the footer band
 * matches the main column width (same as central page content). Tablet and desktop:
 * does not extend into the end panel or under the start navigation column.
 *
 * Brand lockup uses the 14px Wikimedia mark and a single-line banana wordmark built from
 * `brand-wordmark-wikimedia` + `brand-wordmark-developer-portal` (same translatable keys as
 * the header) in Montserrat. Not the Figma horizontal 227×14px footer logo asset yet.
 * Legal copy includes outbound links to Foundation policy pages and the CC BY-SA license
 * deed (`config/siteFooter.ts`).
 *
 * **Spacing:** `padding-block-start: --spacing-150` (24px), `padding-block-end: --spacing-300`
 * (48px) — 48px from legal copy to the page bottom per Figma.
 */
const { $bananaI18n } = useNuxtApp()

const footerAccessibleLabel = computed( () => $bananaI18n( 'footer-aria-label' ) )
const footerBrandAccessibleLabel = computed( () => $bananaI18n( 'app-title' ) )
const brandWordmarkTopLabel = computed( () => $bananaI18n( 'brand-wordmark-wikimedia' ) )
const brandWordmarkBottomLabel = computed( () => $bananaI18n( 'brand-wordmark-developer-portal' ) )
const privacyPolicyLabel = computed( () => $bananaI18n( 'footer-privacy-policy' ) )
const termsOfUseLabel = computed( () => $bananaI18n( 'footer-terms-of-use' ) )
const attributionCreatedBySentence = computed( () => $bananaI18n( 'footer-attribution-sentence-created-by' ) )
const attributionLicenseBeforeSentence = computed( () => $bananaI18n( 'footer-attribution-sentence-license-before' ) )
const licenseLinkLabel = computed( () => $bananaI18n( 'footer-license-link-label' ) )
const attributionLicenseAfterSentence = computed( () => $bananaI18n( 'footer-attribution-sentence-license-after' ) )
const attributionTrademarkSentence = computed( () => $bananaI18n( 'footer-attribution-sentence-trademark' ) )
const policyNavLabel = computed( () => $bananaI18n( 'footer-policy-nav-label' ) )
</script>

<template>
	<footer
		class="shell-site-footer"
		:aria-label="footerAccessibleLabel"
	>
		<div class="shell-site-footer__inner">
			<div class="shell-site-footer__brand-row">
				<div
					class="shell-site-footer__brand"
					:aria-label="footerBrandAccessibleLabel"
				>
					<img
						class="shell-site-footer__mark"
						src="/images/developer-portal-logo-mark.svg"
						width="14"
						height="14"
						alt=""
						aria-hidden="true"
					>
					<span
						class="shell-site-footer__wordmark"
						aria-hidden="true"
					>
						<span class="shell-site-footer__wordmark-part">{{ brandWordmarkTopLabel }}</span>
						<span class="shell-site-footer__wordmark-part">{{ brandWordmarkBottomLabel }}</span>
					</span>
				</div>
				<nav
					class="shell-site-footer__policy-nav"
					:aria-label="policyNavLabel"
				>
					<a
						class="shell-site-footer__link"
						:href="SITE_FOOTER_PRIVACY_POLICY_URL"
					>{{ privacyPolicyLabel }}</a>
					<a
						class="shell-site-footer__link"
						:href="SITE_FOOTER_TERMS_OF_USE_URL"
					>{{ termsOfUseLabel }}</a>
				</nav>
			</div>
			<p class="shell-site-footer__legal">
				<span class="shell-site-footer__legal-line">{{ attributionCreatedBySentence }}</span>
				<span class="shell-site-footer__legal-line">
					{{ attributionLicenseBeforeSentence }}<a
						class="shell-site-footer__link"
						:href="SITE_FOOTER_CC_BY_SA_LICENSE_URL"
					>{{ licenseLinkLabel }}</a>{{ attributionLicenseAfterSentence }}
				</span>
				<span class="shell-site-footer__legal-line">{{ attributionTrademarkSentence }}</span>
			</p>
		</div>
	</footer>
</template>

<style scoped>
.shell-site-footer {
	box-sizing: border-box;
	inline-size: 100%;
	background-color: var( --background-color-base );
	border-block-start: 1px solid var( --border-color-muted );
	padding-block-start: var( --spacing-150 );
	/* Figma Footer 393:4639 — 48px inset below legal copy to the page bottom. */
	padding-block-end: var( --spacing-300 );
	padding-inline: var( --spacing-200 );
	font-family: var( --font-family-sans-stack );
}

.shell-site-footer__inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var( --spacing-50 );
	inline-size: 100%;
	margin-inline: auto;
}

.shell-site-footer__brand-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	gap: var( --spacing-100 );
}

.shell-site-footer__brand {
	display: inline-flex;
	align-items: center;
	gap: var( --spacing-25 );
	min-inline-size: 0;
	color: var( --color-subtle );
}

.shell-site-footer__mark {
	display: block;
	inline-size: 0.875rem;
	block-size: 0.875rem;
	flex-shrink: 0;
}

.shell-site-footer__wordmark {
	display: inline-flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: 0.25em;
	font-family: var( --font-family-brand-wordmark );
	font-size: var( --font-size-small );
	font-weight: var( --font-weight-bold );
	line-height: var( --line-height-xx-small );
	letter-spacing: 0.02em;
}

.shell-site-footer__wordmark-part {
	white-space: nowrap;
}

.shell-site-footer__policy-nav {
	display: inline-flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	gap: var( --spacing-50 );
}

.shell-site-footer__link {
	font-size: var( --font-size-medium );
	line-height: var( --line-height-small );
	color: var( --color-progressive );
	text-decoration: none;
}

.shell-site-footer__link:hover {
	text-decoration: underline;
}

.shell-site-footer__legal {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0;
	margin: 0;
	max-inline-size: 100%;
	font-size: var( --font-size-small );
	line-height: var( --line-height-small );
	text-align: center;
	color: var( --color-subtle );
}

.shell-site-footer__legal-line {
	display: block;
}

.shell-site-footer__legal .shell-site-footer__link {
	font-size: inherit;
}
</style>
