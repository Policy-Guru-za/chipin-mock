import fs from 'fs';
import path from 'path';
import process from 'process';
import { pathToFileURL } from 'node:url';

import {
  ACTIVE_DOC_STATUSES,
  CRITICAL_TOKEN_CHECKS,
  NON_AUTHORITATIVE_STATUSES,
  bannerForDoc,
  classifyDoc,
  repoRelative,
} from './control-matrix.mjs';
import { DOC_AUDIT_EXCLUDE_DIRS, RETIRED_DOC_ERROR_MESSAGES } from './doc-governance-policy.mjs';
import { collectExecutionArtifactErrors } from './execution-artifact-audit.mjs';

const BANNER_PREFIX = '> **Document Status:**';
const AGENT_GUIDANCE_RULES = [
  {
    test: /^AGENTS\.md$/,
    required: [
      '.agents/skills/napkin/SKILL.md',
      'docs/napkin/napkin.md',
      'progress.md',
      'spec/00_overview.md',
      'Active Full Specs',
      'Quick Tasks',
      'Last Completed Spec',
    ],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^README\.md$/,
    required: ['.agents/skills/napkin/SKILL.md', 'docs/napkin/napkin.md', 'AGENTS.md', 'progress.md', 'spec/00_overview.md'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^workflow-orchestration\.md$/,
    required: ['AGENTS.md', 'progress.md', 'spec/00_overview.md', 'Quick Tasks'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^TESTING\.md$/,
    required: ['progress.md', 'Quick Tasks', 'Last Completed Spec'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^docs\/agent-playbooks\/code_review\.md$/,
    required: [
      '.agents/skills/napkin/SKILL.md',
      'docs/napkin/napkin.md',
      'AGENTS.md',
      'progress.md',
      'Recently Closed Specs',
      'Last Completed Spec',
    ],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^docs\/napkin\/SKILL\.md$/,
    required: ['docs/napkin/napkin.md', 'progress.md', 'Napkin Evidence'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^\.agents\/skills\/napkin\/SKILL\.md$/,
    required: ['docs/napkin/napkin.md', 'progress.md', 'Napkin Evidence'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^\.agents\/skills\/[^/]+\/SKILL\.md$/,
    required: ['../napkin/SKILL.md', 'AGENTS.md', 'progress.md'],
    banned: [/tasks\/todo\.md/g],
  },
];

export const collectDocs = (dir, { repoRoot = dir, excludedDirs = DOC_AUDIT_EXCLUDE_DIRS } = {}) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (excludedDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectDocs(fullPath, { repoRoot, excludedDirs }));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => repoRelative(a, repoRoot).localeCompare(repoRelative(b, repoRoot)));
};

const splitFrontMatter = (text) => {
  if (!text.startsWith('---\n')) {
    return { frontMatter: '', body: text };
  }

  const end = text.indexOf('\n---\n', 4);
  if (end === -1) {
    return { frontMatter: '', body: text };
  }

  return {
    frontMatter: text.slice(0, end + 5),
    body: text.slice(end + 5),
  };
};

const stripExistingBanner = (body) => {
  if (!body.startsWith(BANNER_PREFIX)) return body;

  const lines = body.split('\n');
  let index = 0;
  while (index < lines.length && (lines[index].startsWith('> ') || lines[index] === '')) {
    index += 1;
    if (index >= 4 && lines[index - 1] === '' && lines[index - 2]?.startsWith('> ')) {
      break;
    }
  }
  return lines.slice(index).join('\n').replace(/^\n+/, '');
};

const syncBanner = (filePath, metadata, repoRoot) => {
  const banner = bannerForDoc(filePath, metadata, { cwd: repoRoot });
  const text = fs.readFileSync(filePath, 'utf8');
  const { frontMatter, body } = splitFrontMatter(text);
  const strippedBody = stripExistingBanner(body);
  const nextBody = banner ? `${banner}${strippedBody}` : strippedBody;
  const normalizedBody = nextBody.endsWith('\n') ? nextBody : `${nextBody}\n`;
  const nextText = `${frontMatter}${normalizedBody}`;

  if (nextText !== text) {
    fs.writeFileSync(filePath, nextText);
  }
};

const markdownLinkTargets = (text) => {
  const targets = [];
  const regex = /\[[^\]]*]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(text))) {
    const target = match[1].trim();
    if (
      !target ||
      target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('mailto:') ||
      target.startsWith('data:') ||
      target.startsWith('#') ||
      /^`.*`$/.test(target) ||
      /^\d+%$/.test(target)
    ) {
      continue;
    }
    targets.push(target);
  }
  return targets;
};

const resolveLink = (docPath, target) => {
  const clean = target.split('#')[0].split('?')[0];
  if (!clean) return null;
  return path.resolve(path.dirname(docPath), clean);
};

const renderMatrix = (docsWithMetadata) => {
  const lines = [
    '# Document Control Matrix',
    '',
    `Review baseline: workspace state on March 12, 2026.`,
    '',
    'This matrix is generated from `scripts/docs/control-matrix.mjs`. Run `pnpm docs:audit -- --sync` after doc moves or status changes.',
    '',
    '## Status Legend',
    '',
    '- `current-authoritative`: current source of truth',
    '- `current-operational`: current process or agent instruction',
    '- `current-reference`: current supporting reference',
    '- `reference-non-authoritative`: useful context only; not source of truth',
    '- `historical-plan`: preserved plan or proposal',
    '- `historical-evidence`: preserved execution record',
    '- `working-memory`: operational memory, not canonical product documentation',
    '',
    '## Matrix',
    '',
    '| Path | Tier | Status | Owner | Source of truth | Last reviewed | Superseded by |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const { path: filePath, metadata } of docsWithMetadata) {
    lines.push(
      `| \`${filePath}\` | ${metadata.tier} | ${metadata.status} | ${metadata.owner} | ${metadata.sourceOfTruth} | ${metadata.lastReviewed} | ${metadata.supersededBy || '—'} |`
    );
  }

  lines.push('');
  return `${lines.join('\n')}`;
};

const withMatrixDoc = (filePaths, docControlPath, repoRoot) => {
  if (filePaths.includes(docControlPath)) return filePaths;
  return [...filePaths, docControlPath].sort((a, b) =>
    repoRelative(a, repoRoot).localeCompare(repoRelative(b, repoRoot))
  );
};

const syncDocs = (docsWithMetadata, docControlPath, repoRoot) => {
  for (const { fullPath, metadata } of docsWithMetadata) {
    if (!fs.existsSync(fullPath)) continue;
    syncBanner(fullPath, metadata, repoRoot);
  }

  fs.writeFileSync(docControlPath, `${renderMatrix(docsWithMetadata)}\n`);
};

const collectMatrixSyncErrors = (docControlPath, docsWithMetadata) => {
  const errors = [];
  const matrixText = fs.existsSync(docControlPath) ? fs.readFileSync(docControlPath, 'utf8') : '';
  const expectedMatrix = `${renderMatrix(docsWithMetadata)}\n`;

  if (matrixText !== expectedMatrix) {
    errors.push('Document control matrix is out of sync. Run `pnpm docs:audit -- --sync` to regenerate it.');
  }

  return errors;
};

const collectBannerErrors = (filePath, metadata, text) => {
  const errors = [];
  const hasBanner = text.includes(BANNER_PREFIX);

  if (NON_AUTHORITATIVE_STATUSES.has(metadata.status) && !hasBanner) {
    errors.push(`${filePath}: non-authoritative docs must include a status banner.`);
  }

  if (!NON_AUTHORITATIVE_STATUSES.has(metadata.status) && metadata.status !== 'working-memory' && hasBanner) {
    errors.push(`${filePath}: current docs should not carry a non-authoritative status banner.`);
  }

  return errors;
};

const collectLinkErrors = (filePath, fullPath, text) => {
  const errors = [];

  for (const target of markdownLinkTargets(text)) {
    const resolvedTarget = resolveLink(fullPath, target);
    if (!resolvedTarget) continue;
    if (!fs.existsSync(resolvedTarget)) {
      errors.push(`${filePath}: broken markdown link -> ${target}`);
    }
  }

  return errors;
};

const collectTokenErrors = (filePath, metadata, text) => {
  if (!ACTIVE_DOC_STATUSES.has(metadata.status)) {
    return [];
  }

  const errors = [];
  for (const check of CRITICAL_TOKEN_CHECKS) {
    if (check.pattern.test(text)) {
      errors.push(`${filePath}: contains banned active-doc token (${check.label}).`);
    }
    check.pattern.lastIndex = 0;
  }

  return errors;
};

const collectGuidanceErrors = (filePath, text) => {
  const guidanceRule = AGENT_GUIDANCE_RULES.find((rule) => rule.test.test(filePath));
  if (!guidanceRule) {
    return [];
  }

  const errors = [];
  for (const token of guidanceRule.required) {
    if (!text.includes(token)) {
      errors.push(`${filePath}: missing required execution-system token (${token}).`);
    }
  }

  for (const pattern of guidanceRule.banned) {
    if (pattern.test(text)) {
      errors.push(`${filePath}: contains deprecated execution guidance (${pattern}).`);
    }
    pattern.lastIndex = 0;
  }

  return errors;
};

const collectPerDocErrors = ({ fullPath, path: filePath, metadata }) => {
  if (!fs.existsSync(fullPath)) {
    return [`${filePath}: file is missing from the workspace.`];
  }

  const text = fs.readFileSync(fullPath, 'utf8');

  return [
    ...collectBannerErrors(filePath, metadata, text),
    ...collectLinkErrors(filePath, fullPath, text),
    ...collectTokenErrors(filePath, metadata, text),
    ...collectGuidanceErrors(filePath, text),
  ];
};

export const collectDocsWithMetadata = (filePaths, { repoRoot = process.cwd() } = {}) => {
  const docsWithMetadata = [];
  const errors = [];

  for (const filePath of filePaths) {
    const normalizedPath = repoRelative(filePath, repoRoot);
    const retiredDocError = RETIRED_DOC_ERROR_MESSAGES.get(normalizedPath);
    if (retiredDocError) {
      errors.push(`${normalizedPath}: ${retiredDocError}`);
      continue;
    }

    const metadata = classifyDoc(filePath, { cwd: repoRoot });
    if (!metadata) {
      errors.push(
        `${normalizedPath}: markdown file is in docs:audit scope but has no control-matrix rule. Either exclude its directory from docs governance or classify it in scripts/docs/control-matrix.mjs.`
      );
      continue;
    }

    docsWithMetadata.push({ path: normalizedPath, fullPath: filePath, metadata });
  }

  return { docsWithMetadata, errors };
};

export const collectDocsAuditErrors = ({ repoRoot = process.cwd(), shouldSync = false } = {}) => {
  const docControlPath = path.join(repoRoot, 'docs', 'DOCUMENT_CONTROL_MATRIX.md');
  const docs = withMatrixDoc(collectDocs(repoRoot, { repoRoot }), docControlPath, repoRoot);
  const { docsWithMetadata, errors } = collectDocsWithMetadata(docs, { repoRoot });

  if (shouldSync) {
    syncDocs(docsWithMetadata, docControlPath, repoRoot);
  }

  return {
    errors: [
      ...errors,
      ...collectExecutionArtifactErrors({
        repoRoot,
        repoRelative: (filePath) => repoRelative(filePath, repoRoot),
      }),
      ...collectMatrixSyncErrors(docControlPath, docsWithMetadata),
      ...docsWithMetadata.flatMap(collectPerDocErrors),
    ],
    docsWithMetadata,
  };
};

export const runDocsAudit = ({ repoRoot = process.cwd(), args = process.argv.slice(2) } = {}) => {
  const shouldSync = new Set(args).has('--sync');
  const { errors, docsWithMetadata } = collectDocsAuditErrors({ repoRoot, shouldSync });

  if (errors.length > 0) {
    console.error(`docs:audit failed with ${errors.length} issue(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`docs:audit passed for ${docsWithMetadata.length} markdown files.`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runDocsAudit();
}