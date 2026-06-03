import { PROTOTYPE_DEFAULT_WIKI_USERNAME } from '../../config/auth'
import { usePrototypeAuthSession } from './usePrototypeAuthSession'

/**
 * Form state and interface labels for the prototype login page.
 *
 * @returns Reactive fields, banana-i18n labels, and submit handler.
 */
export function useLoginPage() {
	const { $bananaI18n } = useNuxtApp()
	const { signInAndGoToAccount } = usePrototypeAuthSession()

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
		const wikiUsername = username.value.trim() || PROTOTYPE_DEFAULT_WIKI_USERNAME
		signInAndGoToAccount( wikiUsername )
	}

	return {
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
	}
}
