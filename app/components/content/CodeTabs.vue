<script setup lang="ts">
import type { Ref } from 'vue'

interface Tab {
	label: string
}

const tabs = ref<Tab[]>( [] )
const activeTab = ref( '' )

function registerTab( label: string ) {
	if ( !tabs.value.find( t => t.label === label ) ) {
		tabs.value.push( { label } )
	}
	if ( !activeTab.value ) {
		activeTab.value = label
	}
}

provide( 'code-tabs:register', registerTab )
provide( 'code-tabs:active', activeTab )
</script>

<template>
	<div class="code-tabs">
		<div class="code-tabs__header" role="tablist">
			<button
				v-for="tab in tabs"
				:key="tab.label"
				role="tab"
				:aria-selected="activeTab === tab.label"
				class="code-tabs__tab"
				:class="{ 'code-tabs__tab--active': activeTab === tab.label }"
				@click="activeTab = tab.label"
			>
				{{ tab.label }}
			</button>
		</div>
		<div class="code-tabs__content">
			<slot />
		</div>
	</div>
</template>

<style scoped>
.code-tabs {
	margin-block: var( --spacing-100 );
	border: 1px solid var( --border-color-base );
	border-radius: var( --border-radius-base );
	overflow: hidden;
}

.code-tabs__header {
	display: flex;
	background-color: var( --background-color-neutral-subtle );
	border-block-end: 1px solid var( --border-color-base );
}

.code-tabs__tab {
	padding-block: var( --spacing-75 );
	padding-inline: var( --spacing-150 );
	background: none;
	border: none;
	border-block-end: 2px solid transparent;
	margin-block-end: -1px;
	cursor: pointer;
	font-family: inherit;
	font-size: var( --font-size-medium );
	color: var( --color-base );
	transition: color 100ms, border-color 100ms;
}

.code-tabs__tab:hover {
	color: var( --color-progressive );
}

.code-tabs__tab--active {
	color: var( --color-progressive );
	border-block-end-color: var( --color-progressive );
	font-weight: var( --font-weight-bold );
}
</style>
