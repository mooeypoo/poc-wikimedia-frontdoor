import { WIKIMEDIA_CREATE_ACCOUNT_URL } from '../../config/auth'
import { useAccountResetApiKeyDialog } from './useAccountResetApiKeyDialog'
import { useDeveloperTokenDashboard } from './useDeveloperTokenDashboard'
import { useAccountPath } from './useAccountPath'
import { usePrototypeAuthSession } from './usePrototypeAuthSession'
import { useShellAuthNavigation } from './useShellAuthNavigation'

/**
 * Interface labels and view-models for the account dashboard page (UI layer).
 *
 * **Access (product decision):** The dashboard is shown only when a real Meta OAuth
 * session is active (`useOAuthSession` via {@link useShellAuthNavigation}).
 * Unauthenticated visits to `/account` show the logged-out gate (Figma 1001:18723).
 * Log in starts the same OAuth + PKCE flow as the header link, with `returnTo` set
 * to the locale-aware account path so users land back on the dashboard after auth.
 * Create an account is a mock outbound link to Wikimedia CreateAccount
 * (`WIKIMEDIA_CREATE_ACCOUNT_URL`) — no post-registration return handling.
 *
 * Composes {@link usePrototypeAuthSession} (placeholder key seeding when logged in),
 * {@link useDeveloperTokenDashboard}, and {@link useAccountResetApiKeyDialog}.
 *
 * @returns Account access flag, logged-out gate labels/handlers, and logged-in
 *   dashboard fields for `app/pages/account.vue`.
 */
export function useAccountDashboardPage() {
	const { $bananaI18n } = useNuxtApp()
	const {
		initializePrototypeAccountSession,
		clearPrototypeAccountSession
	} = usePrototypeAuthSession()
	const {
		isLoggedIn: isOAuthLoggedIn,
		username: oauthUsername,
		login: startOAuthLogin,
		logout: oauthLogout
	} = useShellAuthNavigation()
	const { accountPath } = useAccountPath()
	const tokenDashboard = useDeveloperTokenDashboard()
	const resetApiKeyDialog = useAccountResetApiKeyDialog()

	/**
	 * Real OAuth session required to view the dashboard (not the prototype seed alone).
	 */
	const isAccountDashboardAccessible = computed( () => isOAuthLoggedIn.value )

	/**
	 * Meta OAuth username when logged in (dashboard title). Empty when logged out.
	 */
	const username = computed( () => {
		if ( isOAuthLoggedIn.value && oauthUsername.value ) {
			return oauthUsername.value
		}

		return ''
	} )

	const loggedOutPageTitle = computed( () => $bananaI18n( 'account-logged-out-title' ) )
	const loggedOutDescription = computed( () => $bananaI18n( 'account-logged-out-description' ) )
	const loginButtonLabel = computed( () => $bananaI18n( 'header-login-label' ) )
	const createAccountPrompt = computed( () =>
		$bananaI18n( 'account-logged-out-create-account-prompt' )
	)
	const createAccountLinkLabel = computed( () =>
		$bananaI18n( 'account-logged-out-create-account-link' )
	)
	/** Mock outbound CreateAccount URL from `config/auth.ts` (no return handoff). */
	const createAccountUrl = WIKIMEDIA_CREATE_ACCOUNT_URL
	const createAccountLinkAriaLabel = computed( () =>
		tokenDashboard.externalLinkAccessibleLabel( createAccountLinkLabel.value )
	)

	/**
	 * Starts Meta OAuth + PKCE with return to the locale-aware `/account` path
	 * (same flow as the header Log in link).
	 *
	 * @returns Nothing.
	 */
	function onAccountPageLogin(): void {
		startOAuthLogin( accountPath.value )
	}

	/**
	 * Seeds placeholder API key rows after a real OAuth login (usability fixtures only).
	 *
	 * @returns Nothing.
	 */
	function initializeAccountDashboardPlaceholders(): void {
		if ( !isOAuthLoggedIn.value ) {
			return
		}

		initializePrototypeAccountSession()
	}

	/**
	 * Signs out of OAuth, clears placeholder key session state, and returns home.
	 *
	 * @returns Nothing.
	 */
	async function signOutFromAccountDashboard(): Promise<void> {
		oauthLogout()
		clearPrototypeAccountSession()
		await navigateTo( '/' )
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
	const signOutButtonLabel = computed( () => $bananaI18n( 'account-sign-out-button' ) )
	const writeTokenNotice = computed( () => $bananaI18n( 'account-write-token-notice' ) )

	const learnMoreOAuthLabel = computed( () => $bananaI18n( 'account-learn-more-oauth-link' ) )
	const learnMoreOwnerOnlyLabel = computed( () => $bananaI18n( 'account-learn-more-owner-only-link' ) )
	const developerJwtListAriaLabel = computed( () => $bananaI18n( 'account-developer-tokens-list-label' ) )
	const oauthConsumersListAriaLabel = computed( () => $bananaI18n( 'account-oauth-tokens-list-label' ) )

	const learnMoreAboutBefore = computed( () => $bananaI18n( 'account-learn-more-about-before' ) )

	return {
		isAccountDashboardAccessible,
		username,
		loggedOutPageTitle,
		loggedOutDescription,
		loginButtonLabel,
		createAccountPrompt,
		createAccountLinkLabel,
		createAccountUrl,
		createAccountLinkAriaLabel,
		onAccountPageLogin,
		initializeAccountDashboardPlaceholders,
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
		writeTokenNotice,
		signOutButtonLabel,
		learnMoreOAuthLabel,
		learnMoreOwnerOnlyLabel,
		learnMoreAboutBefore,
		developerJwtListAriaLabel,
		oauthConsumersListAriaLabel
	}
}
