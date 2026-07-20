/**
 * Kind of API key targeted by the account dashboard Reset confirmation dialog.
 */
export type AccountResetApiKeyKind = 'personal' | 'application'

/**
 * Opens and confirms the Reset API key dialog (Figma node 626:7921).
 *
 * Dialog open state and the pending key id/kind live here so `account.vue` and
 * `AccountResetApiKeyDialog` stay presentational (AGENTS: no business logic in
 * components). Confirm calls {@link useDeveloperTokenDashboard} regenerate
 * handlers, which update `prototypeDeveloperTokens` (Meta-owned reset later).
 *
 * Side effects: watches `isResetDialogOpen` and clears the pending key id/kind
 * when the dialog closes (Cancel, close button, backdrop/Escape, or after confirm).
 *
 * @returns {{
 *   isResetDialogOpen: import('vue').Ref<boolean>,
 *   resetDialogTitle: import('vue').ComputedRef<string>,
 *   resetDialogBody: import('vue').ComputedRef<string>,
 *   resetDialogCloseLabel: import('vue').ComputedRef<string>,
 *   resetDialogPrimaryAction: import('vue').ComputedRef<{ label: string, actionType: 'progressive' }>,
 *   resetDialogDefaultAction: import('vue').ComputedRef<{ label: string }>,
 *   openResetPersonalApiKeyDialog: (tokenId: string) => void,
 *   openResetApplicationApiKeyDialog: (consumerId: string) => void,
 *   closeResetApiKeyDialog: () => void,
 *   confirmResetApiKeyDialog: () => void
 * }} Dialog open state, banana-i18n labels / Codex action objects, and open/close/confirm handlers.
 */
export function useAccountResetApiKeyDialog() {
	const { $bananaI18n } = useNuxtApp()
	const {
		onConfirmResetDeveloperJwt,
		onConfirmResetOAuthConsumer
	} = useDeveloperTokenDashboard()

	const isResetDialogOpen = ref( false )
	const pendingResetKind = ref<AccountResetApiKeyKind | null>( null )
	const pendingResetId = ref<string | null>( null )

	const resetDialogTitle = computed( () => {
		if ( pendingResetKind.value === 'personal' ) {
			return $bananaI18n( 'account-reset-dialog-title-personal' )
		}

		return $bananaI18n( 'account-reset-dialog-title-application' )
	} )

	const resetDialogBody = computed( () => $bananaI18n( 'account-reset-dialog-body' ) )
	const resetDialogCancelLabel = computed( () => $bananaI18n( 'account-reset-dialog-cancel' ) )
	const resetDialogConfirmLabel = computed( () => $bananaI18n( 'account-reset-dialog-confirm' ) )
	const resetDialogCloseLabel = computed( () => $bananaI18n( 'account-reset-dialog-close' ) )

	const resetDialogPrimaryAction = computed( () => ( {
		label: resetDialogConfirmLabel.value,
		actionType: 'progressive' as const
	} ) )

	const resetDialogDefaultAction = computed( () => ( {
		label: resetDialogCancelLabel.value
	} ) )

	/**
	 * Opens the Reset confirmation dialog for a personal API key.
	 *
	 * @param tokenId - Personal API key row id.
	 * @returns Nothing.
	 */
	function openResetPersonalApiKeyDialog( tokenId: string ): void {
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
		pendingResetKind.value = 'application'
		pendingResetId.value = consumerId
		isResetDialogOpen.value = true
	}

	/**
	 * Closes the dialog without regenerating credentials.
	 *
	 * @returns Nothing.
	 */
	function closeResetApiKeyDialog(): void {
		isResetDialogOpen.value = false
	}

	/**
	 * Confirms reset: regenerates prototype credentials for the pending key, then closes.
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
			onConfirmResetDeveloperJwt( resetId )
		} else {
			onConfirmResetOAuthConsumer( resetId )
		}

		closeResetApiKeyDialog()
	}

	// Clear pending target when the dialog closes (Cancel, ✕, backdrop, or after confirm).
	watch( isResetDialogOpen, ( isOpen ) => {
		if ( !isOpen ) {
			pendingResetKind.value = null
			pendingResetId.value = null
		}
	} )

	return {
		isResetDialogOpen,
		resetDialogTitle,
		resetDialogBody,
		resetDialogCloseLabel,
		resetDialogPrimaryAction,
		resetDialogDefaultAction,
		openResetPersonalApiKeyDialog,
		openResetApplicationApiKeyDialog,
		closeResetApiKeyDialog,
		confirmResetApiKeyDialog
	}
}
