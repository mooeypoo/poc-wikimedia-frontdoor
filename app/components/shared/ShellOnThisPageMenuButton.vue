<script setup lang="ts">
import {
	CdxIcon,
	CdxMenuButton,
	type MenuButtonItemData,
	type MenuGroupData,
	type MenuItemValue
} from '@wikimedia/codex'
import { cdxIconExpand } from '@wikimedia/codex-icons'
import type { OnThisPageHeading } from '../../utils/collectOnThisPageHeadings'
import { isolatePickerLabel } from '../../utils/bidiLabel'

/**
 * Header “On this page” quiet MenuButton for viewports below 1280px
 * (Figma Off-wiki page templates 50:2563).
 *
 * Neutral quiet trigger with expand icon. Each `h2` is a menu group label; the
 * `h2` itself and nested `h3`s are selectable items (Codex MenuGroupData).
 *
 * @see ARCHITECTURE.md → On-this-page navigation
 */
const props = defineProps<{
	/** Visible trigger label (banana-i18n “On this page”). */
	label: string
	/** `h2` sections with optional nested `h3` children. */
	sections: OnThisPageHeading[]
}>()

const emit = defineEmits<{
	/** User selected a heading from the menu. */
	'heading-select': [ headingId: string ]
}>()

const selectedHeadingId = ref<MenuItemValue | undefined>( undefined )

/**
 * Builds Codex menu entries: one group per `h2` (group label + selectable `h2` /
 * `h3` items). Lone `h2`s without children are flat items.
 *
 * @returns MenuButton item / group list.
 */
const menuEntries = computed( (): ( MenuButtonItemData | MenuGroupData )[] => {
	const entries: ( MenuButtonItemData | MenuGroupData )[] = []

	for ( const section of props.sections ) {
		const sectionLabel = isolatePickerLabel( section.label )

		if ( section.children.length === 0 ) {
			entries.push( {
				value: section.id,
				label: sectionLabel
			} )
			continue
		}

		// Group label = h2; selectable items = h2 + nested h3 (deepest TOC level).
		entries.push( {
			label: sectionLabel,
			items: [
				{
					value: section.id,
					label: sectionLabel
				},
				...section.children.map( ( child ) => ( {
					value: child.id,
					label: isolatePickerLabel( child.label )
				} ) )
			]
		} )
	}

	return entries
} )

/**
 * Handles MenuButton selection and clears the model so the same item can re-fire.
 *
 * @param nextValue - Selected menu item value (heading id).
 * @returns Nothing.
 */
function onMenuSelection( nextValue: MenuItemValue | null | undefined ): void {
	if ( nextValue === null || nextValue === undefined ) {
		return
	}

	emit( 'heading-select', String( nextValue ) )
	selectedHeadingId.value = undefined
}
</script>

<template>
	<CdxMenuButton
		v-model:selected="selectedHeadingId"
		class="shell-on-this-page-menu-button"
		weight="quiet"
		:menu-items="menuEntries"
		:aria-label="label"
		@update:selected="onMenuSelection"
	>
		<span class="shell-on-this-page-menu-button__label">{{ label }}</span>
		<CdxIcon
			:icon="cdxIconExpand"
			size="small"
		/>
	</CdxMenuButton>
</template>

<style scoped>
/*
 * Figma 50:2563 — neutral quiet MenuButton, bold label + expand icon,
 * opposite the primary nav tabs in the header row.
 */
.shell-on-this-page-menu-button {
	flex: 0 0 auto;
	align-self: flex-end;
}

.shell-on-this-page-menu-button :deep( .cdx-button ) {
	font-weight: var( --font-weight-bold );
	color: var( --color-base );
}

.shell-on-this-page-menu-button__label {
	margin-inline-end: var( --spacing-25 );
}
</style>
