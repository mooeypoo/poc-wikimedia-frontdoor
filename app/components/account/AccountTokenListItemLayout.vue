<script setup lang="ts">
/**
 * Shared card chrome for account dashboard token list items (Figma “List-element”).
 *
 * Title row and actions sit on one line; body content stacks below. Surface uses
 * Codex `--background-color-neutral-subtle` and the exploratory **4px** border
 * radius from `config/explorerSurfaces.ts` via
 * `--fd-explorer-controls-surface-border-radius` (not a Codex token; under
 * consideration as a future system default — same as explorer project controls
 * and module rail).
 */
</script>

<template>
	<li class="account-token-list-item">
		<article class="account-token-list-item__card">
			<div class="account-token-list-item__header">
				<div class="account-token-list-item__title">
					<slot name="title" />
				</div>
				<div class="account-token-list-item__actions">
					<slot name="actions" />
				</div>
			</div>
			<div class="account-token-list-item__body">
				<slot />
			</div>
		</article>
	</li>
</template>

<style scoped>
.account-token-list-item {
	list-style: none;
	margin: 0;
	padding: 0;
}

.account-token-list-item__card {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-50 );
	padding: var( --spacing-100 );
	background-color: var( --background-color-neutral-subtle );
	/*
	 * Exploratory radius from config/explorerSurfaces.ts (mirrored in page-grid.css).
	 * Not a Codex token (`--border-radius-base` is 2px); under consideration as a
	 * future system default. Same token as explorer project controls + module rail.
	 */
	border-radius: var( --fd-explorer-controls-surface-border-radius );
}

.account-token-list-item__header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}

.account-token-list-item__title {
	min-inline-size: 0;
}

.account-token-list-item__actions {
	display: inline-flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: var( --spacing-50 );
	flex-shrink: 0;
}

.account-token-list-item__body {
	display: flex;
	flex-direction: column;
	gap: var( --spacing-50 );
	min-inline-size: 0;
}
</style>
