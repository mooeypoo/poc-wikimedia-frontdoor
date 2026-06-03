<script setup lang="ts">
import type { Ref } from 'vue'

const props = defineProps<{
	label: string
}>()

const registerTab = inject<( label: string ) => void>( 'code-tabs:register' )
const activeTab = inject<Ref<string>>( 'code-tabs:active' )

const isActive = computed( () => activeTab?.value === props.label )

onMounted( () => {
	registerTab?.( props.label )
} )
</script>

<template>
	<div
		v-show="isActive"
		role="tabpanel"
		class="code-tab"
	>
		<slot />
	</div>
</template>
