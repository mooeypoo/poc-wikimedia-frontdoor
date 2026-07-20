import { useAccountResetApiKeyDialog } from './useAccountResetApiKeyDialog'
import { useDeveloperTokenDashboard } from './useDeveloperTokenDashboard'
import { useOAuthSession } from './useOAuthSession'
import { usePrototypeAuthSession } from './usePrototypeAuthSession'

/**
 * Interface labels and view-models for the account dashboard page (UI layer).
 *
 * Composes {@link usePrototypeAuthSession}, {@link useDeveloperTokenDashboard},
 * and {@link useAccountResetApiKeyDialog}; spreads token dashboard and Reset
 * dialog fields at the root for correct Vue template unwrapping. When a real
 * OAuth session is active, the displayed username comes from OAuth rather than
 * the prototype seed user.
 *
 * @returns Merged account dashboard fields for `app/pages/account.vue`: OAuth-preferred
 *   username, banana section/action labels, token list view-models and handlers from
 *   {@link useDeveloperTokenDashboard}, and Reset dialog state/handlers from
 *   {@link useAccountResetApiKeyDialog}.
 */
export function useAccountDashboardPage() {
	const { $bananaI18n } = useNuxtApp()
	const {
		username: prototypeUsername,
		initializePrototypeAccountSession,
		resetPrototypeAccountSession
	} = usePrototypeAuthSession()
	const { isLoggedIn: isOAuthLoggedIn, username: oauthUsername, logout: oauthLogout } = useOAuthSession()
	const tokenDashboard = useDeveloperTokenDashboard()
	const resetApiKeyDialog = useAccountResetApiKeyDialog()

	/**
	 * Prefer the Meta OAuth username when the user arrived via header login;
	 * fall back to the prototype dashboard seed for direct `/account` visits.
	 */
	const username = computed( () => {
		if ( isOAuthLoggedIn.value && oauthUsername.value ) {
			return oauthUsername.value
		}

		return prototypeUsername.value
	} )

	/**
	 * Signs out of OAuth when active (then returns to the site root); otherwise
	 * resets the prototype dashboard session in place.
	 *
	 * @returns Nothing.
	 */
	async function signOutFromAccountDashboard(): Promise<void> {
		if ( isOAuthLoggedIn.value ) {
			oauthLogout()
			await navigateTo( '/' )
			return
		}

		resetPrototypeAccountSession()
	}

	const pageTitleBefore = computed( () => $bananaI18n( 'account-page-title-before' ) )
	const pageTitleAfter = computed( () => $bananaI18n( 'account-page-title-after' ) )

	const developerTokensSectionTitle = computed( () => $bananaI18n( 'account-developer-tokens-heading' ) )
	const developerTokensDescription = computed( () => $bananaI18n( 'account-developer-tokens-description' ) )
	const oauthTokensSectionTitle = computed( () => $bananaI18n( 'account-oauth-tokens-heading' ) )
	const oauthTokensDescription = computed( () => $bananaI18n( 'account-oauth-tokens-description' ) )

	const requestNewTokenLabel = computed( () => $bananaI18n( 'account-request-new-token-button' ) )
	const developerJwtEmptyMessage = computed( () => $bananaI18n( 'account-developer-tokens-empty' ) )
	const oauthConsumersEmptyMessage = computed( () => $bananaI18n( 'account-oauth-tokens-empty' ) )

	const resetTokenLabel = computed( () => $bananaI18n( 'account-reset-token-button' ) )
	const deleteTokenLabel = computed( () => $bananaI18n( 'account-delete-token-button' ) )
	const signOutButtonLabel = computed( () => $bananaI18n( 'account-sign-out-button' ) )
	const writeTokenNotice = computed( () => $bananaI18n( 'account-write-token-notice' ) )

	const learnMoreOAuthLabel = computed( () => $bananaI18n( 'account-learn-more-oauth-link' ) )
	const learnMoreOwnerOnlyLabel = computed( () => $bananaI18n( 'account-learn-more-owner-only-link' ) )
	const developerJwtListAriaLabel = computed( () => $bananaI18n( 'account-developer-tokens-list-label' ) )
	const oauthConsumersListAriaLabel = computed( () => $bananaI18n( 'account-oauth-tokens-list-label' ) )

	const learnMoreAboutBefore = computed( () => $bananaI18n( 'account-learn-more-about-before' ) )

	const learnMoreOAuthAriaLabel = computed( () =>
		tokenDashboard.externalLinkAccessibleLabel( learnMoreOAuthLabel.value )
	)
	const learnMoreOwnerOnlyAriaLabel = computed( () =>
		tokenDashboard.externalLinkAccessibleLabel( learnMoreOwnerOnlyLabel.value )
	)

	return {
		username,
		initializePrototypeAccountSession,
		resetPrototypeAccountSession: signOutFromAccountDashboard,
		...tokenDashboard,
		...resetApiKeyDialog,
		pageTitleBefore,
		pageTitleAfter,
		developerTokensSectionTitle,
		developerTokensDescription,
		oauthTokensSectionTitle,
		oauthTokensDescription,
		requestNewTokenLabel,
		developerJwtEmptyMessage,
		oauthConsumersEmptyMessage,
		resetTokenLabel,
		deleteTokenLabel,
		writeTokenNotice,
		signOutButtonLabel,
		learnMoreOAuthLabel,
		learnMoreOwnerOnlyLabel,
		learnMoreOAuthAriaLabel,
		learnMoreOwnerOnlyAriaLabel,
		learnMoreAboutBefore,
		developerJwtListAriaLabel,
		oauthConsumersListAriaLabel
	}
}
