<script setup lang="ts">
/**
 * Shared card chrome for account dashboard token list items (Figma “List-element”).
 *
 * Title row and actions sit on one line; body content stacks below.
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
