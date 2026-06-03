import { useDeveloperTokenDashboard } from './useDeveloperTokenDashboard'
import { usePrototypeAuthSession } from './usePrototypeAuthSession'

/**
 * Interface labels and view-models for the account dashboard page (UI layer).
 *
 * Composes {@link usePrototypeAuthSession} and {@link useDeveloperTokenDashboard};
 * spreads token dashboard refs at the root for correct Vue template unwrapping.
 *
 * @returns Merged {@link usePrototypeAuthSession} and {@link useDeveloperTokenDashboard} fields
 *   plus banana-i18n labels and aria strings for `app/pages/account.vue`.
 */
export function useAccountDashboardPage() {
	const { $bananaI18n } = useNuxtApp()
	const {
		username,
		requireAuthentication,
		ensureDashboardSeedData,
		signOutAndGoToLogin
	} = usePrototypeAuthSession()
	const tokenDashboard = useDeveloperTokenDashboard()

	const pageTitleBefore = computed( () => $bananaI18n( 'account-page-title-before' ) )
	const pageTitleAfter = computed( () => $bananaI18n( 'account-page-title-after' ) )

	const developerTokensSectionTitle = computed( () => $bananaI18n( 'account-developer-tokens-heading' ) )
	const developerTokensDescription = computed( () => $bananaI18n( 'account-developer-tokens-description' ) )
	const oauthTokensSectionTitle = computed( () => $bananaI18n( 'account-oauth-tokens-heading' ) )
	const oauthTokensDescription = computed( () => $bananaI18n( 'account-oauth-tokens-description' ) )

	const requestDeveloperTokenGuidance = computed( () => $bananaI18n( 'account-request-developer-token-guidance' ) )
	const requestOAuthApplicationGuidance = computed( () => $bananaI18n( 'account-request-oauth-application-guidance' ) )

	const requestDeveloperTokenLabel = computed( () => $bananaI18n( 'account-request-developer-token-link' ) )
	const requestOAuthApplicationLabel = computed( () => $bananaI18n( 'account-request-oauth-application-link' ) )

	const developerJwtEmptyMessage = computed( () => $bananaI18n( 'account-developer-tokens-empty' ) )
	const oauthConsumersEmptyMessage = computed( () => $bananaI18n( 'account-oauth-tokens-empty' ) )

	const deleteTokenLabel = computed( () => $bananaI18n( 'account-delete-token-button' ) )
	const adjustScopeLabel = computed( () => $bananaI18n( 'account-adjust-scope-link' ) )
	const signOutButtonLabel = computed( () => $bananaI18n( 'account-sign-out-button' ) )

	const learnMoreOAuthLabel = computed( () => $bananaI18n( 'account-learn-more-oauth-link' ) )
	const learnMoreOwnerOnlyLabel = computed( () => $bananaI18n( 'account-learn-more-owner-only-link' ) )
	const developerJwtListAriaLabel = computed( () => $bananaI18n( 'account-developer-tokens-list-label' ) )
	const oauthConsumersListAriaLabel = computed( () => $bananaI18n( 'account-oauth-tokens-list-label' ) )
	const rowActionsMenuAriaLabel = computed( () => $bananaI18n( 'account-row-actions-menu-aria' ) )

	const revealSecretAriaLabel = computed( () => $bananaI18n( 'account-reveal-secret-aria' ) )
	const hideSecretAriaLabel = computed( () => $bananaI18n( 'account-hide-secret-aria' ) )
	const copySecretAriaLabel = computed( () => $bananaI18n( 'account-copy-secret-aria' ) )
	const tokenSecretActionsAriaLabel = computed( () => $bananaI18n( 'account-token-secret-actions-aria' ) )
	const developerTokensHelpBefore = computed( () => $bananaI18n( 'account-developer-tokens-help-before' ) )
	const developerTokensHelpAfter = computed( () => $bananaI18n( 'account-developer-tokens-help-after' ) )

	const oauthTokensHelpBefore = computed( () => $bananaI18n( 'account-oauth-tokens-help-before' ) )
	const oauthTokensHelpAfter = computed( () => $bananaI18n( 'account-oauth-tokens-help-after' ) )

	const requestDeveloperTokenAriaLabel = computed( () =>
		tokenDashboard.externalLinkAccessibleLabel( requestDeveloperTokenLabel.value )
	)
	const requestOAuthApplicationAriaLabel = computed( () =>
		tokenDashboard.externalLinkAccessibleLabel( requestOAuthApplicationLabel.value )
	)
	const learnMoreOAuthAriaLabel = computed( () =>
		tokenDashboard.externalLinkAccessibleLabel( learnMoreOAuthLabel.value )
	)
	const learnMoreOwnerOnlyAriaLabel = computed( () =>
		tokenDashboard.externalLinkAccessibleLabel( learnMoreOwnerOnlyLabel.value )
	)
	// Spread at root so template and child props receive unwrapped computed values
	// (refs nested under `tokenDashboard` do not auto-unwrap in Vue templates).
	return {
		username,
		requireAuthentication,
		ensureDashboardSeedData,
		signOutAndGoToLogin,
		...tokenDashboard,
		pageTitleBefore,
		pageTitleAfter,
		developerTokensSectionTitle,
		developerTokensDescription,
		requestDeveloperTokenGuidance,
		oauthTokensSectionTitle,
		oauthTokensDescription,
		requestOAuthApplicationGuidance,
		requestDeveloperTokenLabel,
		requestOAuthApplicationLabel,
		requestDeveloperTokenAriaLabel,
		requestOAuthApplicationAriaLabel,
		developerJwtEmptyMessage,
		oauthConsumersEmptyMessage,
		deleteTokenLabel,
		adjustScopeLabel,
		rowActionsMenuAriaLabel,
		revealSecretAriaLabel,
		hideSecretAriaLabel,
		copySecretAriaLabel,
		tokenSecretActionsAriaLabel,
		signOutButtonLabel,
		learnMoreOAuthLabel,
		learnMoreOwnerOnlyLabel,
		learnMoreOAuthAriaLabel,
		learnMoreOwnerOnlyAriaLabel,
		developerTokensHelpBefore,
		developerTokensHelpAfter,
		oauthTokensHelpBefore,
		oauthTokensHelpAfter,
		developerJwtListAriaLabel,
		oauthConsumersListAriaLabel
	}
}
