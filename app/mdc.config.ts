import type { ShikiTransformer } from 'shiki'

const lineNumbersTransformer: ShikiTransformer = {
	name: 'line-numbers',
	pre( node ) {
		// __raw carries the fence-info string beyond the language tag; Shiki's own
		// ShikiTransformerContextMeta is deliberately untyped for this purpose.
		const meta = ( this.options.meta as { __raw?: string } ).__raw ?? ''
		if ( meta.includes( ':line-numbers' ) ) {
			// Use a class (not data attr): ProsePre.vue only forwards class to <pre>.
			this.addClassToHast( node, 'has-line-numbers' )
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
