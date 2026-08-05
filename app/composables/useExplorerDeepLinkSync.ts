import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { buildExplorerDirectPath } from '../utils/explorerRoute'
import {
	buildOperationAnchor,
	findOperationByAnchor,
	operationAnchorFromHash
} from '../utils/explorerOperationAnchor'
import { WIKI_INSTANCES } from '../../config/instances'
import { EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR } from '../../config/explorerInternalSidebarExperiment'
import type {
	ExplorerBootstrapModule,
	ExplorerOperationTarget,
	SelectModuleOptions
} from './useExplorerBootstrap'
import type { ExplorerDeepLinkNotice } from './useExplorerDeepLinkNotice'

/** Default community instance the explorer falls back to on a failed deep-link load. */
const DEFAULT_WIKI_INSTANCE_ID = WIKI_INSTANCES[ 0 ]?.id ?? 'enwiki'

interface ExplorerDeepLinkSyncOptions {
	selectedWikiInstanceId: Ref<string>
	selectedModuleName: Ref<string>
	selectedModule: Ref<ExplorerBootstrapModule | null>
	pendingOperationTarget: Ref<ExplorerOperationTarget | null>
	isCommunityMode: Ref<boolean>
	hasInstanceBootstrapError: Ref<boolean>
	deepLinkInstanceId: Ref<string | null>
	deepLinkNotice: Ref<ExplorerDeepLinkNotice>
	selectModule: ( moduleName: string, options: SelectModuleOptions ) => boolean
}

/**
 * Keeps the community explorer URL in sync with selection state, and recovers
 * from a failed deep-link instance load (ADR §7, §9). Runs after
 * {@link useExplorerBootstrap} (it consumes its reactive selection state).
 *
 * Outbound (state → URL): writes `/explorer/direct/<instance>/<module>` as the
 * instance/module change, and `#<operation>` as an endpoint is focused —
 * `router.push` for a newly focused operation (so Back steps through operations),
 * `router.replace` for instance/module changes and when the operation clears. The
 * operation hash is cleared on any instance/module change (ADR decision: clear on
 * switch). Writes never remount Scalar because `scalarReferenceKey` keys on
 * `route.path`, not the hash.
 *
 * Inbound (Back/Forward): re-focuses an operation when the hash changes within the
 * same module (popstate). Cross-module Back is intentionally out of scope for now
 * (see docs/adr-explorer-deep-linking.md open questions).
 *
 * Instance fallback: if the initial deep-linked instance fails to bootstrap, falls
 * back once to the default instance with an `instance-fallback` notice.
 *
 * @param options - Reactive selection state and the bootstrap's `selectModule`.
 * @returns Nothing (establishes watchers).
 */
export function useExplorerDeepLinkSync( options: ExplorerDeepLinkSyncOptions ): void {
	const {
		selectedWikiInstanceId,
		selectedModuleName,
		selectedModule,
		pendingOperationTarget,
		isCommunityMode,
		hasInstanceBootstrapError,
		deepLinkInstanceId,
		deepLinkNotice,
		selectModule
	} = options

	const route = useRoute()
	const router = useRouter()

	// The operation currently reflected in the URL hash. Distinct from the transient
	// pendingOperationTarget (which clears after focus): this persists until the
	// module or instance changes, so clearing the focus request never drops the hash.
	const currentOperationAnchor = ref( '' )
	let previousWrittenAnchor = ''
	let hasHandledInstanceFallback = false

	// One-shot: recover from a failed initial deep-link instance load.
	watch( hasInstanceBootstrapError, ( hasError ) => {
		if (
			!hasError
			|| hasHandledInstanceFallback
			|| !deepLinkInstanceId.value
			|| selectedWikiInstanceId.value !== deepLinkInstanceId.value
			|| deepLinkInstanceId.value === DEFAULT_WIKI_INSTANCE_ID
		) {
			return
		}

		hasHandledInstanceFallback = true
		deepLinkNotice.value = 'instance-fallback'
		// Triggers a re-bootstrap of the default instance via the instance watcher.
		selectedWikiInstanceId.value = DEFAULT_WIKI_INSTANCE_ID
	} )

	// Clear the operation hash on any instance/module change (created before the
	// capture watcher below so that, when a single selection changes both module and
	// operation, the capture wins in the same tick).
	watch( [ selectedWikiInstanceId, selectedModuleName ], () => {
		currentOperationAnchor.value = ''
	} )

	// Capture the anchor whenever an operation is focused.
	watch( pendingOperationTarget, ( operationTarget ) => {
		if ( operationTarget ) {
			currentOperationAnchor.value = buildOperationAnchor( operationTarget.method, operationTarget.path )
		}
	} )

	// Outbound: reflect selection state into the URL.
	watch(
		[ selectedWikiInstanceId, selectedModuleName, currentOperationAnchor ],
		() => {
			if ( !isCommunityMode.value || !selectedModuleName.value ) {
				return
			}

			const desiredPath = buildExplorerDirectPath(
				selectedWikiInstanceId.value,
				selectedModuleName.value
			)
			// In sidebar mode Scalar owns the operation hash (its own format): preserve
			// it while the path is unchanged (initial load, same-module Scalar nav) and
			// clear it only when the module/instance changes. In manual-rail mode we own
			// the hash with our slug format.
			const desiredHash = EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR
				? ( route.path === desiredPath ? route.hash : '' )
				: ( currentOperationAnchor.value ? `#${ currentOperationAnchor.value }` : '' )

			if ( route.path === desiredPath && route.hash === desiredHash ) {
				previousWrittenAnchor = currentOperationAnchor.value
				return
			}

			const isNewlyFocusedOperation =
				Boolean( currentOperationAnchor.value )
				&& currentOperationAnchor.value !== previousWrittenAnchor
			previousWrittenAnchor = currentOperationAnchor.value

			const navigationTarget = { path: desiredPath, hash: desiredHash }
			if ( isNewlyFocusedOperation ) {
				void router.push( navigationTarget )
			} else {
				void router.replace( navigationTarget )
			}
		},
		{ flush: 'post' }
	)

	// Inbound (popstate): re-focus when the hash changes within the same module.
	// Skipped in sidebar mode — Scalar handles Back/Forward operation focus natively
	// from its own hash.
	watch( () => route.hash, ( nextHash ) => {
		if ( EXPLORER_USE_INTERNAL_SCALAR_SIDEBAR ) {
			return
		}

		const nextAnchor = operationAnchorFromHash( nextHash )
		if ( !nextAnchor || nextAnchor === currentOperationAnchor.value ) {
			return
		}

		const activeModule = selectedModule.value
		if ( !activeModule ) {
			return
		}

		const targetOperation = findOperationByAnchor( activeModule.operations, nextAnchor )
		if ( !targetOperation ) {
			return
		}

		selectModule( activeModule.name, {
			source: 'deep-link',
			operationTarget: {
				moduleName: activeModule.name,
				method: targetOperation.method,
				path: targetOperation.path,
				summary: targetOperation.summary,
				operationId: targetOperation.operationId,
				primaryTag: targetOperation.primaryTag
			}
		} )
	} )
}
