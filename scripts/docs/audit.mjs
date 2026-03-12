import fs from 'fs';
import path from 'path';
import process from 'process';

import {
  ACTIVE_DOC_STATUSES,
  CRITICAL_TOKEN_CHECKS,
  NON_AUTHORITATIVE_STATUSES,
  bannerForDoc,
  classifyDoc,
  repoRelative,
} from './control-matrix.mjs';
import { collectExecutionArtifactErrors } from './execution-artifact-audit.mjs';

const repoRoot = process.cwd();
const args = new Set(process.argv.slice(2));
const shouldSync = args.has('--sync');

const DOC_CONTROL_PATH = path.join(repoRoot, 'docs', 'DOCUMENT_CONTROL_MATRIX.md');
const DOC_GLOBS_EXCLUDE = new Set(['node_modules', '.git', 'coverage', 'output']);
const BANNER_PREFIX = '> **Document Status:**';
const AGENT_GUIDANCE_RULES = [
  {
    test: /^AGENTS\.md$/,
    required: ['progress.md', 'spec/00_overview.md'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^README\.md$/,
    required: ['progress.md', 'spec/00_overview.md'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^workflow-orchestration\.md$/,
    required: ['progress.md', 'spec/00_overview.md'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^TESTING\.md$/,
    required: ['progress.md'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^docs\/agent-playbooks\/code_review\.md$/,
    required: ['progress.md', 'spec/00_overview.md'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^docs\/napkin\/SKILL\.md$/,
    required: ['progress.md', 'spec/'],
    banned: [/tasks\/todo\.md/g],
  },
  {
    test: /^\.agents\/skills\/[^/]+\/SKILL\.md$/,
    required: ['progress.md', 'spec/00_overview.md'],
    banned: [/tasks\/todo\.md/g],
  },
];

const collectDocs = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (DOC_GLOBS_EXCLUDE.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectDocs(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => repoRelative(a).localeCompare(repoRelative(b)));
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

const syncBanner = (filePath, metadata) => {
  const banner = bannerForDoc(filePath, metadata);
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

const withMatrixDoc = (filePaths) => {
  if (filePaths.includes(DOC_CONTROL_PATH)) return filePaths;
  return [...filePaths, DOC_CONTROL_PATH].sort((a, b) => repoRelative(a).localeCompare(repoRelative(b)));
};

const docs = withMatrixDoc(collectDocs(repoRoot));
const docsWithMetadata = docs.map((filePath) => {
  const metadata = classifyDoc(filePath);
  if (!metadata) {
    throw new Error(`No control-matrix classification rule for ${repoRelative(filePath)}`);
  }
  return { path: repoRelative(filePath), fullPath: filePath, metadata };
});

if (shouldSync) {
  for (const { fullPath, metadata } of docsWithMetadata) {
    if (!fs.existsSync(fullPath)) continue;
    syncBanner(fullPath, metadata);
  }

  const syncedDocs = withMatrixDoc(collectDocs(repoRoot)).map((filePath) => {
    const metadata = classifyDoc(filePath);
    if (!metadata) {
      throw new Error(`No control-matrix classification rule for ${repoRelative(filePath)}`);
    }
    return { path: repoRelative(filePath), fullPath: filePath, metadata };
  });
  fs.writeFileSync(DOC_CONTROL_PATH, `${renderMatrix(syncedDocs)}\n`);
}

const errors = collectExecutionArtifactErrors({ repoRoot, repoRelative });

const matrixText = fs.existsSync(DOC_CONTROL_PATH) ? fs.readFileSync(DOC_CONTROL_PATH, 'utf8') : '';
const expectedMatrix = `${renderMatrix(docsWithMetadata)}\n`;
if (matrixText !== expectedMatrix) {
  errors.push(
    'Document control matrix is out of sync. Run `pnpm docs:audit -- --sync` to regenerate it.'
  );
}

for (const { fullPath, path: filePath, metadata } of docsWithMetadata) {
  if (!fs.existsSync(fullPath)) {
    errors.push(`${filePath}: file is missing from the workspace.`);
    continue;
  }
  const text = fs.readFileSync(fullPath, 'utf8');
  const hasBanner = text.includes(BANNER_PREFIX);

  if (NON_AUTHORITATIVE_STATUSES.has(metadata.status) && !hasBanner) {
    errors.push(`${filePath}: non-authoritative docs must include a status banner.`);
  }

  if (!NON_AUTHORITATIVE_STATUSES.has(metadata.status) && metadata.status !== 'working-memory' && hasBanner) {
    errors.push(`${filePath}: current docs should not carry a non-authoritative status banner.`);
  }

  for (const target of markdownLinkTargets(text)) {
    const resolvedTarget = resolveLink(fullPath, target);
    if (!resolvedTarget) continue;
    if (!fs.existsSync(resolvedTarget)) {
      errors.push(`${filePath}: broken markdown link -> ${target}`);
    }
  }

  if (ACTIVE_DOC_STATUSES.has(metadata.status)) {
    for (const check of CRITICAL_TOKEN_CHECKS) {
      if (check.pattern.test(text)) {
        errors.push(`${filePath}: contains banned active-doc token (${check.label}).`);
      }
      check.pattern.lastIndex = 0;
    }
  }

  const guidanceRule = AGENT_GUIDANCE_RULES.find((rule) => rule.test.test(filePath));
  if (guidanceRule) {
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
  }
}

if (errors.length > 0) {
  console.error(`docs:audit failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`docs:audit passed for ${docsWithMetadata.length} markdown files.`);
