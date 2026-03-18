import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { collectExecutionArtifactErrors } from '../../scripts/docs/execution-artifact-audit.mjs';

type FixtureStatus = 'Active' | 'Done' | 'Superseded';
type FixtureExitState = 'pending' | 'satisfied' | 'not-satisfied';

type FixtureSpec = {
  id: string;
  title: string;
  status: FixtureStatus;
  exitCriteriaState: FixtureExitState;
  successorSlot: string;
  notes: string;
  closedAt?: string;
};

type ActiveSpecRow = {
  spec: string;
  title: string;
  owner?: string;
  stage?: string;
  status?: string;
  blockers?: string;
  nextStep?: string;
  lastUpdated?: string;
};

type QuickTaskRow = {
  taskId: string;
  scope: string;
  owner?: string;
  verification?: string;
  status?: string;
  nextStep?: string;
};

type FixtureProgress = {
  activeSpecs?: ActiveSpecRow[];
  quickTasks?: QuickTaskRow[];
  recentlyClosedSpecs?: string[];
  recentlyClosedLines?: string[];
  lastCompletedSpec: string;
  lastGreenCommands?: string[];
  dogfoodEvidence?: string[];
  napkinEvidence?: string[];
};

const tempDirs: string[] = [];

const repoRelative = (repoRoot: string, filePath: string) => {
  const relativePath = path.isAbsolute(filePath) ? path.relative(repoRoot, filePath) : filePath;
  return relativePath.split(path.sep).join('/');
};

const specDoc = ({ id, status, exitCriteriaState, successorSlot, notes }: FixtureSpec) => `# ${id}

## Objective

- Fixture objective.

## In Scope

- Fixture scope.

## Out Of Scope

- Fixture exclusions.

## Dependencies

- Fixture dependency.

## Stage Plan

1. Fixture stage.

## Test Gate

- Fixture gate.

## Exit Criteria

- Fixture exit criteria.

## Final State

- Status: ${status}
- Exit Criteria State: ${exitCriteriaState}
- Successor Slot: ${successorSlot}
- Notes: ${notes}
`;

const overviewDoc = (rows: FixtureSpec[]) => {
  const header = [
    '# Spec Overview',
    '',
    'Use numbered specs for full-path work.',
    '',
    'Multiple numbered specs may be `Active` at the same time.',
    '',
    'Create new specs on demand with the next available two-digit slot in `spec/`.',
    '',
    'Fast-path work lives in [`../progress.md`](../progress.md) under `## Quick Tasks` and does not require a numbered spec.',
    '',
    'Status values: `Active`, `Done`, `Superseded`.',
    'Terminal rows in slot 40 and above must carry `Closed At` in UTC ISO-8601 once they close.',
    '',
    '| Spec | Title | Status | Closed At | Owner | Depends On | Notes |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];

  const body = rows.map(
    ({ id, title, status, notes, closedAt }) =>
      `| \`${id}\` | ${title} | ${status} | ${closedAt ?? '—'} | Codex | None | ${notes} |`
  );

  return `${[...header, ...body, ''].join('\n')}`;
};

const activeSpecsSection = (rows: ActiveSpecRow[] = []) => {
  if (rows.length === 0) {
    return ['## Active Full Specs', '', '- None.', ''];
  }

  return [
    '## Active Full Specs',
    '',
    '| Spec | Title | Owner | Stage | Status | Blockers | Next Step | Last Updated |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| \`${row.spec}\` | ${row.title} | ${row.owner ?? 'Codex'} | ${row.stage ?? 'Stage 1'} | ${row.status ?? 'In progress'} | ${row.blockers ?? 'None'} | ${row.nextStep ?? 'Keep going'} | ${row.lastUpdated ?? '2026-03-18'} |`
    ),
    '',
  ];
};

const quickTasksSection = (rows: QuickTaskRow[] = []) => {
  if (rows.length === 0) {
    return ['## Quick Tasks', '', '- None.', ''];
  }

  return [
    '## Quick Tasks',
    '',
    '| Task ID | Scope | Owner | Verification | Status | Next Step |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.taskId} | ${row.scope} | ${row.owner ?? 'Codex'} | ${row.verification ?? '`pnpm test`'} | ${row.status ?? 'In progress'} | ${row.nextStep ?? 'Finish the task'} |`
    ),
    '',
  ];
};

const recentlyClosedSection = ({
  specIds = [],
  lines = [],
}: {
  specIds?: string[];
  lines?: string[];
}) => {
  if (specIds.length === 0 && lines.length === 0) {
    return ['## Recently Closed Specs', '', '- None.', ''];
  }

  const resolvedLines = lines.length > 0 ? lines : specIds.map((id) => `- \`${id}\``);
  return ['## Recently Closed Specs', '', ...resolvedLines, ''];
};

const progressDoc = ({
  activeSpecs = [],
  quickTasks = [],
  recentlyClosedSpecs = [],
  recentlyClosedLines = [],
  lastCompletedSpec,
  lastGreenCommands = ['- `pnpm docs:audit`'],
  dogfoodEvidence = ['- Fixture dogfood evidence.'],
  napkinEvidence = ['- Logged in [`docs/napkin/napkin.md`](./docs/napkin/napkin.md).'],
}: FixtureProgress) =>
  [
    '# Progress',
    '',
    ...activeSpecsSection(activeSpecs),
    ...quickTasksSection(quickTasks),
    ...recentlyClosedSection({ specIds: recentlyClosedSpecs, lines: recentlyClosedLines }),
    '## Last Completed Spec',
    '',
    `- \`${lastCompletedSpec}\``,
    '',
    '## Last Green Commands',
    '',
    ...lastGreenCommands,
    '',
    '## Dogfood Evidence',
    '',
    ...dogfoodEvidence,
    '',
    '## Napkin Evidence',
    '',
    ...napkinEvidence,
    '',
  ].join('\n');

const createFixtureRepo = (specs: FixtureSpec[], progress: FixtureProgress) => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'gifta-exec-audit-'));
  tempDirs.push(repoRoot);

  const specDir = path.join(repoRoot, 'spec');
  mkdirSync(specDir, { recursive: true });

  writeFileSync(path.join(specDir, 'SPEC_TEMPLATE.md'), '# Spec Template\n');
  writeFileSync(path.join(specDir, '00_overview.md'), overviewDoc(specs));
  writeFileSync(path.join(repoRoot, 'progress.md'), progressDoc(progress));

  for (const spec of specs) {
    writeFileSync(path.join(specDir, `${spec.id}.md`), specDoc(spec));
  }

  return repoRoot;
};

const collectErrors = (repoRoot: string) =>
  collectExecutionArtifactErrors({
    repoRoot,
    repoRelative: (filePath: string) => repoRelative(repoRoot, filePath),
  });

afterEach(() => {
  while (tempDirs.length > 0) {
    const repoRoot = tempDirs.pop();
    if (repoRoot) {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  }
});

describe('collectExecutionArtifactErrors - valid ledgers', () => {
  it('passes for multiple active specs and a legacy newest done closure', () => {
    const specs: FixtureSpec[] = [
      {
        id: '39_finished-task',
        title: 'Finished task',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Closed cleanly.',
      },
      {
        id: '40_parallel-workflow-refactor',
        title: 'Parallel workflow refactor',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Active parallel workflow refactor.',
      },
      {
        id: '41_docs-audit-follow-up',
        title: 'Docs audit follow-up',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Active docs-audit follow-up.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      activeSpecs: [
        { spec: '40_parallel-workflow-refactor', title: 'Parallel workflow refactor' },
        { spec: '41_docs-audit-follow-up', title: 'Docs audit follow-up' },
      ],
      recentlyClosedSpecs: ['39_finished-task'],
      lastCompletedSpec: '39_finished-task',
    });

    expect(collectErrors(repoRoot)).toEqual([]);
  });

  it('passes for a fast-path quick task with no active numbered spec', () => {
    const specs: FixtureSpec[] = [
      {
        id: '40_finished-task',
        title: 'Finished task',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Closed cleanly.',
        closedAt: '2026-03-18T10:00:00Z',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      quickTasks: [
        {
          taskId: 'Q-2026-03-18-1',
          scope: 'Tighten a single copy string',
          verification: '`pnpm lint`',
        },
      ],
      recentlyClosedSpecs: ['40_finished-task'],
      lastCompletedSpec: '40_finished-task',
    });

    expect(collectErrors(repoRoot)).toEqual([]);
  });

  it('passes when a superseded bullet mentions its active successor', () => {
    const specs: FixtureSpec[] = [
      {
        id: '40_latest-done',
        title: 'Latest done',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Latest completed proof owner.',
        closedAt: '2026-03-18T09:00:00Z',
      },
      {
        id: '41_gate-a-stop',
        title: 'Gate A stop',
        status: 'Superseded',
        exitCriteriaState: 'not-satisfied',
        successorSlot: '42',
        notes: 'Rolled forward into slot 42.',
        closedAt: '2026-03-18T10:00:00Z',
      },
      {
        id: '42_follow-on',
        title: 'Follow-on work',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Active follow-on work.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      activeSpecs: [{ spec: '42_follow-on', title: 'Follow-on work' }],
      recentlyClosedLines: ['- `41_gate-a-stop` — Superseded by `42_follow-on`'],
      lastCompletedSpec: '40_latest-done',
    });

    expect(collectErrors(repoRoot)).toEqual([]);
  });
});

describe('collectExecutionArtifactErrors - invalid ledgers', () => {
  it('fails when an active overview spec is missing from Active Full Specs', () => {
    const specs: FixtureSpec[] = [
      {
        id: '39_finished-task',
        title: 'Finished task',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Closed cleanly.',
      },
      {
        id: '40_parallel-workflow-refactor',
        title: 'Parallel workflow refactor',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Still active.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      activeSpecs: [],
      recentlyClosedSpecs: ['39_finished-task'],
      lastCompletedSpec: '39_finished-task',
    });

    expect(collectErrors(repoRoot)).toContain(
      'progress.md: overview Active spec 40_parallel-workflow-refactor must appear in `## Active Full Specs`.'
    );
  });

  it('fails when a terminal spec in slot 40+ omits Closed At', () => {
    const specs: FixtureSpec[] = [
      {
        id: '40_finished-task',
        title: 'Finished task',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Closed cleanly.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      recentlyClosedSpecs: ['40_finished-task'],
      lastCompletedSpec: '40_finished-task',
    });

    expect(collectErrors(repoRoot)).toContain(
      'spec/00_overview.md: terminal spec 40_finished-task must include `Closed At` once slot 40 and above adopted the new closure-order contract.'
    );
  });

  it('fails when the newest timestamped terminal spec is omitted from Recently Closed Specs', () => {
    const specs: FixtureSpec[] = [
      {
        id: '40_older-done',
        title: 'Older done',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Older proof owner.',
        closedAt: '2026-03-18T09:00:00Z',
      },
      {
        id: '41_newest-done',
        title: 'Newest done',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Newest done spec.',
        closedAt: '2026-03-18T10:00:00Z',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      recentlyClosedSpecs: ['40_older-done'],
      lastCompletedSpec: '40_older-done',
    });

    expect(collectErrors(repoRoot)).toContain(
      'progress.md: newest recently closed entry must mirror the newest timestamped terminal spec (41_newest-done).'
    );
  });

  it('fails when Last Completed Spec misses the latest timestamped Done proof owner', () => {
    const specs: FixtureSpec[] = [
      {
        id: '40_latest-done',
        title: 'Latest done',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Latest completed proof owner.',
        closedAt: '2026-03-18T09:00:00Z',
      },
      {
        id: '41_gate-a-stop',
        title: 'Gate A stop',
        status: 'Superseded',
        exitCriteriaState: 'not-satisfied',
        successorSlot: '42',
        notes: 'Rolled forward into slot 42.',
        closedAt: '2026-03-18T10:00:00Z',
      },
      {
        id: '42_follow-on',
        title: 'Follow-on work',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Still active.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      activeSpecs: [{ spec: '42_follow-on', title: 'Follow-on work' }],
      recentlyClosedSpecs: ['41_gate-a-stop'],
      lastCompletedSpec: '39_older-done',
    });

    expect(collectErrors(repoRoot)).toContain(
      'progress.md: last completed spec 39_older-done does not exist in spec/.'
    );
    expect(collectErrors(repoRoot)).toContain(
      'progress.md: `## Last Completed Spec` must match the latest timestamped Done spec (40_latest-done).'
    );
  });
});
