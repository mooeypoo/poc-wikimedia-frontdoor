import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
	{
		ignores: [
			/*
			 * Hidden directories hold build output and tooling state, not our
			 * source, and flat config no longer skips them. Directories only, so
			 * hidden config files still count.
			 */
			'**/.*/',
			'dist/',
			/*
			 * Generated catalogs are rewritten wholesale by the scripts in
			 * ./scripts, so a style fix here is undone on the next regeneration.
			 */
			'**/*.generated.*'
		]
	},

	{
		/*
		 * Correctness rules @nuxt/eslint leaves off. no-shadow stays on default
		 * options; turning on builtinGlobals would treat every Nuxt auto-import
		 * as a global, so importing one of our own composables would read as a
		 * shadow.
		 */
		rules: {
			'no-shadow': 'error',
			'no-promise-executor-return': 'error'
		}
	},

	{
		/*
		 * Wikimedia house style, plus every place a preset default would undo
		 * it. Tabs, single quotes and the absence of semicolons come from the
		 * stylistic block in nuxt.config.ts, which is what registers this plugin.
		 */
		rules: {
			'@stylistic/array-bracket-spacing': [ 'error', 'always' ],
			'@stylistic/computed-property-spacing': [ 'error', 'always' ],
			'@stylistic/space-in-parens': [ 'error', 'always' ],
			'@stylistic/template-curly-spacing': [ 'error', 'always' ],

			/*
			 * Off, not merely unset: the preset turns this on at 'before'. The
			 * source splits near evenly between leading and trailing operators,
			 * so either setting rewrites about 150 sites to settle a coin flip.
			 */
			'@stylistic/operator-linebreak': 'off',

			/*
			 * We quote an object key only where the key itself demands it. The
			 * preset's consistent-as-needed instead spreads quotes to every
			 * sibling of a key like 'x-scalar-active-document'.
			 */
			'@stylistic/quote-props': [ 'error', 'as-needed' ],

			/*
			 * eslint-plugin-vue re-implements the same spacing rules for template
			 * expressions and defaults every one to 'never'. Without this block a
			 * fix run reformats .vue templates away from the style the script
			 * blocks above enforce.
			 */
			'vue/array-bracket-spacing': [ 'error', 'always' ],
			'vue/space-in-parens': [ 'error', 'always' ],
			'vue/template-curly-spacing': [ 'error', 'always' ],

			/*
			 * Block comments in <style> align their continuation ` * ` with a
			 * space after the indenting tab. JS tokenizes those as comments and
			 * skips them, CSS gets a raw-line check, so smart-tabs is what lets
			 * us keep one comment style on both sides of an SFC.
			 */
			'@stylistic/no-mixed-spaces-and-tabs': [ 'error', 'smart-tabs' ],

			/*
			 * The rule's own aria-/data- exemption matches on a literal hyphen, so
			 * it never recognizes a camelCase spelling. ariaLabel props (Shell*Nav
			 * components) must stay camelCase at call sites: Vue's kebab-to-camel
			 * attribute matching does not apply to aria- or data- prefixed names,
			 * so binding :aria-label there does not reach the ariaLabel prop at all.
			 */
			'vue/attribute-hyphenation': [ 'error', 'always', { ignore: [ 'ariaLabel' ] } ]
		}
	}
)
