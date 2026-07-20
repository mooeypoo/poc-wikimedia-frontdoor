import type {
	AccountResetCredentialRow,
	AccountResetDialogStep
} from '../types/accountResetDialog'

/**
 * Kind of API key targeted by the account dashboard Reset confirmation dialog.
 */
export type AccountResetApiKeyKind = 'personal' | 'application'

/**
 * Opens and drives the Reset API key dialog (confirm → success).
 *
 * Confirm step: Figma 626:7921. Success step: Figma 633:7695 (Client ID / Client secret /
 * Refresh token + copy controls). **Credentials shown after Reset are placeholders** —
 * not Meta-issued secrets; real reset backend is pending. Dialog open state, step, and
 * revealed credential rows live here so `account.vue` / `AccountResetApiKeyDialog` stay
 * presentational.
 *
 * Side effects: watches `isResetDialogOpen` and clears pending id/kind, step, and
 * revealed credentials when the dialog closes.
 *
 * @returns {{
 *   isResetDialogOpen: import('vue').Ref<boolean>,
 *   isResetDialogSuccessStep: import('vue').ComputedRef<boolean>,
 *   resetDialogTitle: import('vue').ComputedRef<string>,
 *   resetDialogBody: import('vue').ComputedRef<string>,
 *   resetDialogSuccessIntro: import('vue').ComputedRef<string>,
 *   resetDialogWarning: import('vue').ComputedRef<string>,
 *   resetDialogCloseLabel: import('vue').ComputedRef<string>,
 *   resetDialogCopyAriaLabel: import('vue').ComputedRef<string>,
 *   resetDialogCopiedTooltipLabel: import('vue').ComputedRef<string>,
 *   resetDialogCredentialsListAriaLabel: import('vue').ComputedRef<string>,
 *   resetDialogPrimaryAction: import('vue').ComputedRef<{ label: string, actionType: 'progressive' }>,
 *   resetDialogDefaultAction: import('vue').ComputedRef<{ label: string } | null>,
 *   revealedCredentialRows: import('vue').Ref<import('../types/accountResetDialog').AccountResetCredentialRow[]>,
 *   openResetPersonalApiKeyDialog: (tokenId: string) => void,
 *   openResetApplicationApiKeyDialog: (consumerId: string) => void,
 *   closeResetApiKeyDialog: () => void,
 *   confirmResetApiKeyDialog: () => void,
 *   onResetDialogPrimaryAction: () => void
 * }} Dialog open/step state, banana-i18n labels / Codex actions, Client ID / secret /
 *   refresh-token rows for the success step, and open/confirm/Done handlers.
 */
export function useAccountResetApiKeyDialog() {
	const { $bananaI18n } = useNuxtApp()
	const {
		onConfirmResetDeveloperJwt,
		onConfirmResetOAuthConsumer
	} = useDeveloperTokenDashboard()

	const isResetDialogOpen = ref( false )
	const resetDialogStep = ref<AccountResetDialogStep>( 'confirm' )
	const pendingResetKind = ref<AccountResetApiKeyKind | null>( null )
	const pendingResetId = ref<string | null>( null )
	const revealedCredentialRows = ref<AccountResetCredentialRow[]>( [] )

	const isResetDialogSuccessStep = computed( () => resetDialogStep.value === 'success' )

	const resetDialogTitle = computed( () => {
		if ( pendingResetKind.value === 'personal' ) {
			return $bananaI18n( 'account-reset-dialog-title-personal' )
		}

		return $bananaI18n( 'account-reset-dialog-title-application' )
	} )

	const resetDialogBody = computed( () => $bananaI18n( 'account-reset-dialog-body' ) )
	const resetDialogSuccessIntro = computed( () => $bananaI18n( 'account-reset-dialog-success-intro' ) )
	const resetDialogWarning = computed( () => $bananaI18n( 'account-reset-dialog-warning' ) )
	const resetDialogCancelLabel = computed( () => $bananaI18n( 'account-reset-dialog-cancel' ) )
	const resetDialogConfirmLabel = computed( () => $bananaI18n( 'account-reset-dialog-confirm' ) )
	const resetDialogDoneLabel = computed( () => $bananaI18n( 'account-reset-dialog-done' ) )
	const resetDialogCloseLabel = computed( () => $bananaI18n( 'account-reset-dialog-close' ) )
	const resetDialogCopyAriaLabel = computed( () => $bananaI18n( 'account-copy-secret-aria' ) )
	const resetDialogCopiedTooltipLabel = computed( () => $bananaI18n( 'account-reset-dialog-copied' ) )
	const resetDialogCredentialsListAriaLabel = computed(
		() => $bananaI18n( 'account-reset-dialog-credentials-list-label' )
	)

	const resetDialogPrimaryAction = computed( () => ( {
		label: isResetDialogSuccessStep.value ?
			resetDialogDoneLabel.value :
			resetDialogConfirmLabel.value,
		actionType: 'progressive' as const
	} ) )

	const resetDialogDefaultAction = computed( () => {
		if ( isResetDialogSuccessStep.value ) {
			return null
		}

		return {
			label: resetDialogCancelLabel.value
		}
	} )

	/**
	 * Builds Reset success-dialog rows (Figma 633:7695): Client ID, Client secret, Refresh token.
	 *
	 * @param credentials - Client id, secret, and refresh token to reveal.
	 * @returns Credential rows for the success step (copyable values).
	 */
	function buildResetSuccessCredentialRows( credentials: {
		clientId: string
		clientSecret: string
		refreshToken: string
	} ): AccountResetCredentialRow[] {
		return [
			{
				id: 'client-id',
				label: $bananaI18n( 'account-client-id-label' ),
				value: credentials.clientId
			},
			{
				id: 'client-secret',
				label: $bananaI18n( 'account-client-secret-label' ),
				value: credentials.clientSecret
			},
			{
				id: 'refresh-token',
				label: $bananaI18n( 'account-reset-dialog-refresh-token-label' ),
				value: credentials.refreshToken
			}
		]
	}

	/**
	 * Resets step and revealed credentials (keeps pending kind for the title until close).
	 *
	 * @returns Nothing.
	 */
	function clearSuccessState(): void {
		resetDialogStep.value = 'confirm'
		revealedCredentialRows.value = []
	}

	/**
	 * Opens the Reset confirmation dialog for a personal API key.
	 *
	 * @param tokenId - Personal API key row id.
	 * @returns Nothing.
	 */
	function openResetPersonalApiKeyDialog( tokenId: string ): void {
		clearSuccessState()
		pendingResetKind.value = 'personal'
		pendingResetId.value = tokenId
		isResetDialogOpen.value = true
	}

	/**
	 * Opens the Reset confirmation dialog for an application API key.
	 *
	 * @param consumerId - Application API key row id.
	 * @returns Nothing.
	 */
	function openResetApplicationApiKeyDialog( consumerId: string ): void {
		clearSuccessState()
		pendingResetKind.value = 'application'
		pendingResetId.value = consumerId
		isResetDialogOpen.value = true
	}

	/**
	 * Closes the dialog (Cancel, Done, ✕, backdrop, or Escape).
	 *
	 * @returns Nothing.
	 */
	function closeResetApiKeyDialog(): void {
		isResetDialogOpen.value = false
	}

	/**
	 * Confirm-step primary action: regenerates credentials and switches to the success step.
	 *
	 * @returns Nothing.
	 */
	function confirmResetApiKeyDialog(): void {
		const resetId = pendingResetId.value
		const resetKind = pendingResetKind.value

		if ( !resetId || !resetKind ) {
			closeResetApiKeyDialog()
			return
		}

		if ( resetKind === 'personal' ) {
			const updatedToken = onConfirmResetDeveloperJwt( resetId )

			if ( !updatedToken ) {
				closeResetApiKeyDialog()
				return
			}

			revealedCredentialRows.value = buildResetSuccessCredentialRows( {
				clientId: updatedToken.consumerKey,
				clientSecret: updatedToken.clientSecret,
				refreshToken: updatedToken.refreshToken
			} )
		} else {
			const updatedConsumer = onConfirmResetOAuthConsumer( resetId )

			if ( !updatedConsumer ) {
				closeResetApiKeyDialog()
				return
			}

			revealedCredentialRows.value = buildResetSuccessCredentialRows( {
				clientId: updatedConsumer.consumerKey,
				clientSecret: updatedConsumer.clientSecret,
				refreshToken: updatedConsumer.refreshToken
			} )
		}

		resetDialogStep.value = 'success'
	}

	/**
	 * Footer primary action: Reset on the confirm step, Done on the success step.
	 *
	 * @returns Nothing.
	 */
	function onResetDialogPrimaryAction(): void {
		if ( isResetDialogSuccessStep.value ) {
			closeResetApiKeyDialog()
			return
		}

		confirmResetApiKeyDialog()
	}

	// Clear pending target and success state when the dialog closes.
	watch( isResetDialogOpen, ( isOpen ) => {
		if ( !isOpen ) {
			pendingResetKind.value = null
			pendingResetId.value = null
			clearSuccessState()
		}
	} )

	return {
		isResetDialogOpen,
		isResetDialogSuccessStep,
		resetDialogTitle,
		resetDialogBody,
		resetDialogSuccessIntro,
		resetDialogWarning,
		resetDialogCloseLabel,
		resetDialogCopyAriaLabel,
		resetDialogCopiedTooltipLabel,
		resetDialogCredentialsListAriaLabel,
		resetDialogPrimaryAction,
		resetDialogDefaultAction,
		revealedCredentialRows,
		openResetPersonalApiKeyDialog,
		openResetApplicationApiKeyDialog,
		closeResetApiKeyDialog,
		confirmResetApiKeyDialog,
		onResetDialogPrimaryAction
	}
}
