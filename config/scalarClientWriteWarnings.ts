/**
 * When true, write-endpoint warnings are injected into the Scalar Test Request modal.
 */
export const SCALAR_CLIENT_WRITE_ENDPOINT_WARNINGS_ENABLED = true

/**
 * When true, warnings use a plain yellow HTML block (no Codex) to verify DOM injection.
 */
export const SCALAR_CLIENT_WRITE_WARNING_PLAIN_HTML_PROBE = false

/**
 * When true, write HTTP methods show a Codex confirm dialog before Scalar Send runs.
 *
 * Mock / easy to undo: set to `false` to restore one-click Send with no confirm step.
 */
export const SCALAR_CLIENT_WRITE_REQUEST_CONFIRM_DIALOG_ENABLED = true
