export const DOC_AUDIT_EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  'coverage',
  'output',
  'tmp',
  '.reference',
]);

export const RETIRED_DOC_ERROR_MESSAGES = new Map([
  ['CLAUDE.md', 'retired root doc; use AGENTS.md.'],
]);
