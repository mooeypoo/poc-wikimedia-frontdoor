import { cdxIconTrash } from '@wikimedia/codex-icons'

/** `CdxMenuButton` value for opening Meta-Wiki consumer management from a token row. */
export const ACCOUNT_TOKEN_ROW_ACTION_MANAGE_ON_META = 'manage-on-meta'

/** `CdxMenuButton` value for deleting a prototype token row. */
export const ACCOUNT_TOKEN_ROW_ACTION_DELETE = 'delete-token'

/** Menu item descriptor for account token row overflow actions (`CdxMenuButton`). */
export interface AccountTokenRowMenuItem {
	value: string
	label: string
	icon?: typeof cdxIconTrash
}

/**
 * Builds overflow menu items for an account OAuth consumer list item.
 *
 * @param options - Labels and whether the manage-on-Meta-Wiki action is available.
 * @returns Menu items for `CdxMenuButton`.
 */
export function buildAccountTokenRowMenuItems( options: {
	showManageOnMeta: boolean
	manageOnMetaLabel: string
	deleteLabel: string
} ): AccountTokenRowMenuItem[] {
	const items: AccountTokenRowMenuItem[] = []

	if ( options.showManageOnMeta ) {
		items.push( {
			value: ACCOUNT_TOKEN_ROW_ACTION_MANAGE_ON_META,
			label: options.manageOnMetaLabel
		} )
	}

	items.push( {
		value: ACCOUNT_TOKEN_ROW_ACTION_DELETE,
		label: options.deleteLabel,
		icon: cdxIconTrash
	} )

	return items
}

/**
 * Whether a row menu selection is the delete-token action.
 *
 * @param selectedValue - Value from `CdxMenuButton` `@update:selected`.
 * @returns True when the selection requests row deletion.
 */
export function isAccountTokenRowDeleteAction( selectedValue: string | null ): boolean {
	return selectedValue === ACCOUNT_TOKEN_ROW_ACTION_DELETE
}

/**
 * Whether a row menu selection is the manage-on-Meta-Wiki action.
 *
 * @param selectedValue - Value from `CdxMenuButton` `@update:selected`.
 * @returns True when the selection should open Meta-Wiki consumer management.
 */
export function isAccountTokenRowManageOnMetaAction( selectedValue: string | null ): boolean {
	return selectedValue === ACCOUNT_TOKEN_ROW_ACTION_MANAGE_ON_META
}
