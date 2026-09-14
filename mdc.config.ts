import { transformerMetaHighlight } from '@shikijs/transformers'
import type { ShikiTransformer } from 'shiki'

const lineNumbersTransformer: ShikiTransformer = {
	name: 'line-numbers',
	pre( node ) {
		// __raw carries the fence-info string beyond the language tag; Shiki's own
		// ShikiTransformerContextMeta is deliberately untyped for this purpose.
		const meta = ( this.options.meta as { __raw?: string } ).__raw ?? ''
		if ( meta.includes( ':line-numbers' ) ) {
			node.properties[ 'data-line-numbers' ] = ''
		}
	}
}

export default {
	shiki: {
		transformers: [
			// {1,3-5} meta syntax highlights specific lines
			transformerMetaHighlight(),
			// :line-numbers flag — adds data-line-numbers to <pre>;
			// CSS counters in main.css render the actual numbers
			lineNumbersTransformer
		]
	}
}
