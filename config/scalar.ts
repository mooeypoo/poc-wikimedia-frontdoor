import { EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR } from './explorerInternalSidebarExperiment'

/**
 * Stable Scalar document slug used for operation navigation ids.
 *
 * Must match the `slug` passed in {@link SCALAR_DEFAULT_CONFIGURATION}.
 */
export const SCALAR_DOCUMENT_SLUG = 'front-door-api-explorer'

/**
 * Scalar defaults shared by the explorer page.
 */
export const SCALAR_DEFAULT_CONFIGURATION = {
	slug: SCALAR_DOCUMENT_SLUG,
	hideTestRequestButton: false,
	showDeveloperTools: 'never',
	layout: 'modern' as const,
	theme: 'default' as const,
	// The site owns color mode (useColorMode); Scalar's `darkMode` boolean is
	// driven from it in useScalarConfig. Hide Scalar's own toggle so there is a
	// single control — the shell header switch — as the source of truth.
	hideDarkModeToggle: true,
	// Product (PR #40): Scalar's own sidebar is the community endpoint menu.
	// See config/explorerInternalSidebarExperiment.ts.
	showSidebar: EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR,
	searchHotKey: 'k',
	// Do not load Inter / JetBrains Mono from fonts.scalar.com. Explorer chrome
	// remaps --scalar-font / --scalar-font-code to Codex stacks in main.css.
	withDefaultFonts: false,
	// Disable Scalar's "Ask AI" Agent feature everywhere. Without this the
	// agent surfaces (the sidebar "Ask AI" button, the per-operation "Ask AI
	// Agent" button, and the chat drawer) auto-enable on localhost — and would
	// enable in any environment if an agent key were ever set. `agent.disabled`
	// forces Scalar's internal `agentEnabled` to false, hiding all three. This
	// is Scalar's supported, schema-validated opt-out (see
	// @scalar/types SourceConfiguration.agent); re-verify on Scalar upgrades.
	agent: { disabled: true },
	metaData: {
		title: 'Front Door API Explorer'
	}
}
