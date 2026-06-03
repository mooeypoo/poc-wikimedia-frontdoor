<script setup lang="ts">
/**
 * Shared card chrome for account dashboard token list items (Figma “List-element”).
 */
</script>

<template>
	<li class="account-token-list-item">
		<article class="account-token-list-item__card">
			<div class="account-token-list-item__body">
				<slot />
			</div>
			<div class="account-token-list-item__actions">
				<slot name="actions" />
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
	flex-wrap: wrap;
	align-items: flex-start;
	gap: var( --spacing-50 );
	padding: var( --spacing-100 );
	background-color: var( --background-color-neutral-subtle );
}

.account-token-list-item__body {
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	gap: var( --spacing-25 );
	min-inline-size: 0;
}

.account-token-list-item__actions {
	flex-shrink: 0;
}
</style>
