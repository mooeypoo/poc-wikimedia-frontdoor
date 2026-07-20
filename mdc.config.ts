import { transformerMetaHighlight } from '@shikijs/transformers'
import type { ShikiTransformer } from 'shiki'

const lineNumbersTransformer: ShikiTransformer = {
	name: 'line-numbers',
	pre( node ) {
		const meta = ( this as any ).options?.meta?.__raw ?? ''
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
