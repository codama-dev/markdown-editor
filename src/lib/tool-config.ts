/**
 * TOOL CONFIGURATION
 *
 * Update these values for each new tool.
 * This is the single source of truth for tool-specific settings.
 */

export const TOOL_CONFIG = {
  /** Display name of the tool (e.g. "JSON Formatter") */
  name: 'Markdown Editor & Preview',

  /** Short tagline (e.g. "Format and validate JSON instantly") */
  tagline: 'Write and preview Markdown in real-time',

  /** Full URL of the deployed tool */
  url: 'https://free-markdown-editor.codama.dev/',

  /** localStorage key prefix to avoid collisions between tools */
  storagePrefix: 'codama-markdown-editor',
} as const
