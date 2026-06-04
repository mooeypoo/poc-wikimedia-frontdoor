import type { ShikiTransformer } from 'shiki'

const lineNumbersTransformer: ShikiTransformer = {
	name: 'line-numbers',
	pre( node ) {
		const meta = ( this as any ).options?.meta?.__raw ?? ''
		if ( meta.includes( ':line-numbers' ) ) {
			// Use a class (not data attr): ProsePre.vue only forwards class to <pre>.
			;( this as any ).addClassToHast( node, 'has-line-numbers' )
		}
	}
}

export default {
	shiki: {
		transformers: [
			// :line-numbers flag — adds has-line-numbers class to <pre>;
			// CSS counters in main.css render the actual numbers
			lineNumbersTransformer
		]
	}
}

