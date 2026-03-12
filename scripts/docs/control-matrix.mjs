import path from 'path';

export const REVIEW_DATE = '2026-03-12';
export const REVIEW_DATE_LONG = 'March 12, 2026';
export const DEFAULT_OWNER = 'Ryan Laubscher';

const CURRENT_RUNTIME = '`src/`, `drizzle/migrations/`, `package.json`, `public/v1/openapi.json`';
const CURRENT_RUNTIME_AND_FORENSICS =
  '`src/`, `drizzle/migrations/`, `package.json`, `public/v1/openapi.json`, `docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md`';

const referenceMeta = (supersededBy, sourceOfTruth = CURRENT_RUNTIME) => ({
  tier: 'Tier 2',
  status: 'reference-non-authoritative',
  sourceOfTruth: sourceOfTruth,
  supersededBy,
});

const historicalPlanMeta = (supersededBy, sourceOfTruth = CURRENT_RUNTIME) => ({
  tier: 'Tier 2',
  status: 'historical-plan',
  sourceOfTruth,
  supersededBy,
});

const historicalEvidenceMeta = (supersededBy, sourceOfTruth = CURRENT_RUNTIME_AND_FORENSICS) => ({
  tier: 'Tier 2',
  status: 'historical-evidence',
  sourceOfTruth,
  supersededBy,
});

const exactEntries = {
  'AGENTS.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: '`package.json`, `docs/Platform-Spec-Docs/CANONICAL.md`, `workflow-orchestration.md`, `progress.md`, `spec/00_overview.md`',
    supersededBy: '',
  },
  'README.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: '`AGENTS.md`, `progress.md`, `spec/00_overview.md`, `docs/Platform-Spec-Docs/CANONICAL.md`, `package.json`',
    supersededBy: '',
  },
  'TESTING.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: '`package.json`, `vitest.config.ts`, `tests/`, `progress.md`, `spec/SPEC_TEMPLATE.md`',
    supersededBy: '',
  },
  'BACKLOG.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: '`docs/forensic-audit/REPORT.md`, `docs/Platform-Spec-Docs/CANONICAL.md`, `src/`, `progress.md`',
    supersededBy: '',
  },
  'CHANGELOG.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth:
      '`git log`, `docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md`, `docs/DOCUMENT_CONTROL_MATRIX.md`',
    supersededBy: '',
  },
  'workflow-orchestration.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: '`AGENTS.md`, `progress.md`, `spec/00_overview.md`, `spec/SPEC_TEMPLATE.md`',
    supersededBy: '',
  },
  'progress.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth:
      '`AGENTS.md`, `workflow-orchestration.md`, `.agents/skills/napkin/SKILL.md`, `docs/napkin/napkin.md`, `spec/00_overview.md`, `active numbered spec`, `most recent closed spec`, `most recent done spec`, `git status`',
    supersededBy: '',
  },
  'spec/00_overview.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: '`AGENTS.md`, `workflow-orchestration.md`, `progress.md`, `spec/NN_*.md`',
    supersededBy: '',
  },
  'spec/SPEC_TEMPLATE.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: '`AGENTS.md`, `workflow-orchestration.md`, `spec/00_overview.md`',
    supersededBy: '',
  },
  'tasks/todo.md': {
    tier: 'Tier 2',
    status: 'historical-evidence',
    sourceOfTruth: '`progress.md`, `spec/00_overview.md`, `workflow-orchestration.md`',
    supersededBy: '`progress.md`, `spec/00_overview.md`',
  },
  'docs/DOCUMENT_CONTROL_MATRIX.md': {
    tier: 'Tier 1',
    status: 'current-authoritative',
    sourceOfTruth: '`scripts/docs/control-matrix.mjs`, `scripts/docs/audit.mjs`',
    supersededBy: '',
  },
  'docs/agent-playbooks/code_review.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: '`AGENTS.md`, `progress.md`, `spec/00_overview.md`, `docs/Platform-Spec-Docs/CANONICAL.md`, `TESTING.md`',
    supersededBy: '',
  },
  'docs/napkin/SKILL.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth:
      '`.agents/skills/napkin/SKILL.md`, `docs/napkin/napkin.md`, `AGENTS.md`, `workflow-orchestration.md`, `progress.md`',
    supersededBy: '',
  },
  'docs/napkin/napkin.md': {
    tier: 'Tier 1',
    status: 'working-memory',
    sourceOfTruth: '`session learnings`, `repo workflow`',
    supersededBy: '',
  },
  'docs/forensic-audit/WORKSPACE_BASELINE_2026-03-12.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth: '`git status`, `git log`, `pnpm lint`, `pnpm typecheck`, `pnpm test`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/CANONICAL.md': {
    tier: 'Tier 1',
    status: 'current-authoritative',
    sourceOfTruth: CURRENT_RUNTIME,
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/API.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth: '`src/lib/api/openapi.ts`, `public/v1/openapi.json`, `src/app/api/v1/`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/ARCHITECTURE.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth: '`src/app/`, `src/lib/`, `proxy.ts`, `next.config.js`, `package.json`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/DATA.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth: '`src/lib/db/schema.ts`, `drizzle/migrations/`, `src/lib/db/views.ts`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/INTEGRATIONS.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth:
      '`src/lib/integrations/`, `src/lib/payments/`, `src/lib/config/feature-flags.ts`, `.env.example`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/JOURNEYS.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth: '`src/app/`, `src/components/`, `src/lib/dream-boards/view-model.ts`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/KARRI.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth: '`src/lib/integrations/karri.ts`, `src/lib/integrations/karri-batch.ts`, `.env.example`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/NFR-OPERATIONS.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth:
      '`src/lib/health/checks.ts`, `src/lib/observability/`, `.env.example`, `package.json`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/PAYMENTS.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth:
      '`src/lib/payments/`, `src/app/api/internal/contributions/create/route.ts`, `src/app/api/webhooks/`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/SECURITY.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth:
      '`src/lib/api/auth.ts`, `src/lib/utils/encryption.ts`, `src/lib/auth/`, `src/lib/retention/retention.ts`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/SPEC.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth: '`docs/Platform-Spec-Docs/CANONICAL.md`, `src/`, `package.json`',
    supersededBy: '',
  },
  'docs/Platform-Spec-Docs/UX.md': {
    tier: 'Tier 1',
    status: 'current-reference',
    sourceOfTruth: '`src/app/`, `src/components/`, `src/app/globals.css`',
    supersededBy: '',
  },
  'docs/forensic-audit/STATE.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: CURRENT_RUNTIME_AND_FORENSICS,
    supersededBy: '',
  },
  'docs/forensic-audit/DOC-DRIFT.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: CURRENT_RUNTIME_AND_FORENSICS,
    supersededBy: '',
  },
  'docs/forensic-audit/REPORT.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth: CURRENT_RUNTIME_AND_FORENSICS,
    supersededBy: '',
  },
  'docs/forensic-audit/FORENSIC_AUDIT_REPORT_DRAFT_V2.md': historicalPlanMeta(
    '`docs/forensic-audit/REPORT.md`',
    CURRENT_RUNTIME_AND_FORENSICS
  ),
  'docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth:
      '`docs/implementation-docs/GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md`, `docs/Platform-Spec-Docs/CANONICAL.md`, `package.json`',
    supersededBy: '',
  },
  'docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md': {
    tier: 'Tier 1',
    status: 'current-authoritative',
    sourceOfTruth: '`src/lib/ux-v2/decision-locks.ts`, `docs/Platform-Spec-Docs/CANONICAL.md`',
    supersededBy: '',
  },
  'docs/implementation-docs/GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md': {
    tier: 'Tier 1',
    status: 'current-operational',
    sourceOfTruth:
      '`docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`, `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`, `docs/Platform-Spec-Docs/CANONICAL.md`',
    supersededBy: '',
  },
  'docs/UI-refactors/AI-UI-REFACTOR-PLAYBOOK.md': referenceMeta('`docs/Platform-Spec-Docs/UX.md`'),
};

const patternEntries = [
  {
    test: /^\.agents\/skills\/napkin\/SKILL\.md$/,
    meta: {
      tier: 'Tier 1',
      status: 'current-operational',
      sourceOfTruth: '`docs/napkin/SKILL.md`, `docs/napkin/napkin.md`, `AGENTS.md`, `progress.md`',
      supersededBy: '',
    },
  },
  {
    test: /^\.agents\/skills\/[^/]+\/SKILL\.md$/,
    meta: {
      tier: 'Tier 1',
      status: 'current-operational',
      sourceOfTruth:
        '`.agents/skills/napkin/SKILL.md`, `docs/napkin/napkin.md`, `AGENTS.md`, `workflow-orchestration.md`, `progress.md`, `spec/00_overview.md`, `docs/agent-playbooks/code_review.md`',
      supersededBy: '',
    },
  },
  {
    test: /^spec\/\d{2}_[^/]+\.md$/,
    meta: {
      tier: 'Tier 1',
      status: 'current-operational',
      sourceOfTruth: '`AGENTS.md`, `workflow-orchestration.md`, `progress.md`, `spec/00_overview.md`',
      supersededBy: '',
    },
  },
  {
    test: /^docs\/[^/]+\.md$/,
    meta: referenceMeta('`docs/Platform-Spec-Docs/CANONICAL.md`'),
  },
  {
    test: /^docs\/agent-playbooks\/.*\.md$/,
    meta: {
      tier: 'Tier 1',
      status: 'current-operational',
      sourceOfTruth: '`AGENTS.md`, `README.md`, `docs/Platform-Spec-Docs/CANONICAL.md`',
      supersededBy: '',
    },
  },
  {
    test: /^docs\/UX\/ui-specs\/.*\.md$/,
    meta: referenceMeta('`docs/Platform-Spec-Docs/UX.md`'),
  },
  {
    test: /^docs\/UX\/.*\.md$/,
    meta: referenceMeta('`docs/Platform-Spec-Docs/UX.md`'),
  },
  {
    test: /^docs\/implementation-docs\/evidence\/.*\.md$/,
    meta: historicalEvidenceMeta('`docs/forensic-audit/REPORT.md`'),
  },
  {
    test: /^docs\/implementation-docs\/prompts\/.*\.md$/,
    meta: historicalPlanMeta('`docs/implementation-docs/GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md`'),
  },
  {
    test: /^docs\/implementation-docs\/.*\.md$/,
    meta: historicalPlanMeta('`docs/implementation-docs/GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md`'),
  },
  {
    test: /^docs\/UI-refactors\/.*\.md$/,
    meta: referenceMeta('`docs/Platform-Spec-Docs/UX.md`'),
  },
  {
    test: /^docs\/Integration-docs\/.*\.md$/,
    meta: referenceMeta('`docs/Platform-Spec-Docs/INTEGRATIONS.md`'),
  },
  {
    test: /^docs\/payment-docs\/.*\.md$/,
    meta: referenceMeta('`docs/Platform-Spec-Docs/PAYMENTS.md`'),
  },
  {
    test: /^docs\/runbooks\/.*\.md$/,
    meta: referenceMeta('`docs/Platform-Spec-Docs/NFR-OPERATIONS.md`'),
  },
  {
    test: /^docs\/Demo-Mode\/.*\.md$/,
    meta: referenceMeta('`docs/Platform-Spec-Docs/CANONICAL.md`'),
  },
  {
    test: /^docs\/perf\/.*\.md$/,
    meta: referenceMeta('`docs/Platform-Spec-Docs/NFR-OPERATIONS.md`'),
  },
  {
    test: /^docs\/forensic-audit\/.*\.md$/,
    meta: historicalPlanMeta('`docs/forensic-audit/REPORT.md`', CURRENT_RUNTIME_AND_FORENSICS),
  },
];

export const NON_AUTHORITATIVE_STATUSES = new Set([
  'reference-non-authoritative',
  'historical-plan',
  'historical-evidence',
]);

export const ACTIVE_DOC_STATUSES = new Set([
  'current-authoritative',
  'current-operational',
  'current-reference',
]);

export const CRITICAL_TOKEN_CHECKS = [
  {
    label: 'Removed simplification spec link',
    pattern: /docs\/implementation-docs\/chipin-simplification-spec\.md/g,
  },
  {
    label: 'Removed sandbox implementation link',
    pattern: /docs\/implementation-docs\/SANDBOX_MODE_IMPLEMENTATION\.md/g,
  },
  {
    label: 'Deprecated auth gate flag',
    pattern: /\bAUTH_CLERK_ENABLED\b/g,
  },
  {
    label: 'Stale root middleware reference',
    pattern: /\bmiddleware\.ts\b/g,
  },
  {
    label: 'Stale public API host',
    pattern: /https:\/\/api\.chipin\.co\.za\/v1/g,
  },
];

export const repoRelative = (filePath) => {
  const relativePath = path.isAbsolute(filePath) ? path.relative(process.cwd(), filePath) : filePath;
  return relativePath.split(path.sep).join('/');
};

export const classifyDoc = (filePath) => {
  const normalizedPath = repoRelative(filePath);
  const exact = exactEntries[normalizedPath];
  if (exact) {
    return {
      owner: DEFAULT_OWNER,
      lastReviewed: REVIEW_DATE,
      ...exact,
    };
  }

  const patternEntry = patternEntries.find((entry) => entry.test.test(normalizedPath));
  if (patternEntry) {
    return {
      owner: DEFAULT_OWNER,
      lastReviewed: REVIEW_DATE,
      ...patternEntry.meta,
    };
  }

  return null;
};

export const bannerForDoc = (filePath, metadata) => {
  if (!NON_AUTHORITATIVE_STATUSES.has(metadata.status)) return null;

  const normalizedPath = repoRelative(filePath);
  if (normalizedPath === 'docs/napkin/napkin.md') return null;

  const label =
    metadata.status === 'historical-plan'
      ? 'Historical plan'
      : metadata.status === 'historical-evidence'
        ? 'Historical evidence'
        : 'Reference only';

  const behavior =
    metadata.status === 'historical-evidence'
      ? 'Preserve as execution record. Do not use this file as the source of truth for current runtime behavior or agent policy.'
      : metadata.status === 'historical-plan'
        ? 'Preserve as planning context. Do not use this file as the source of truth for current runtime behavior or agent policy.'
        : 'Useful context only. Do not use this file as the source of truth for current runtime behavior or agent policy.';

  const canonicalReplacement = metadata.supersededBy || '`docs/Platform-Spec-Docs/CANONICAL.md`';

  return [
    `> **Document Status:** ${label}. Reviewed ${REVIEW_DATE_LONG}.`,
    `> ${behavior}`,
    `> Canonical replacement: ${canonicalReplacement}.`,
    '',
  ].join('\n');
};
