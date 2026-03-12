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
};

type FixtureProgress = {
  currentSpec: string;
  currentStage?: string;
  statusLines?: string[];
  blockers?: string[];
  nextStep?: string[];
  lastSessionSpec?: string;
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
    'Use one numbered spec for every work session.',
    '',
    'One active spec at a time unless the user says otherwise.',
    '',
    'Use `NN_session-placeholder` between sessions and rename that same numbered file in place when the next session topic is known.',
    '',
    '| Spec | Title | Status | Owner | Depends On | Notes |',
    '| --- | --- | --- | --- | --- | --- |',
  ];

  const body = rows.map(
    ({ id, title, status, notes }) =>
      `| \`${id}\` | ${title} | ${status} | Codex | None | ${notes} |`
  );

  return `${[...header, ...body, ''].join('\n')}`;
};

const progressDoc = ({
  currentSpec,
  currentStage = 'Fixture stage',
  statusLines = ['- Fixture status.'],
  blockers = ['- None.'],
  nextStep = ['- Fixture next step.'],
  lastSessionSpec,
  lastCompletedSpec,
  lastGreenCommands = ['- `pnpm docs:audit`'],
  dogfoodEvidence = ['- Fixture dogfood evidence.'],
  napkinEvidence = ['- Logged in [`docs/napkin/napkin.md`](./docs/napkin/napkin.md).'],
}: FixtureProgress) => {
  const lines = [
    '# Progress',
    '',
    '## Current Spec',
    '',
    `- \`${currentSpec}\``,
    '',
    '## Current Stage',
    '',
    `- ${currentStage}`,
    '',
    '## Status',
    '',
    ...statusLines,
    '',
    '## Blockers',
    '',
    ...blockers,
    '',
    '## Next Step',
    '',
    ...nextStep,
    '',
  ];

  if (lastSessionSpec) {
    lines.push('## Last Session Spec', '', `- \`${lastSessionSpec}\``, '');
  }

  lines.push(
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
    ''
  );

  return lines.join('\n');
};
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
  it('passes for a done last session with an active successor placeholder', () => {
    const specs: FixtureSpec[] = [
      {
        id: '02_completed-session',
        title: 'Completed session',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Closed cleanly.',
      },
      {
        id: '03_session-placeholder',
        title: 'Placeholder',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Active placeholder.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      currentSpec: '03_session-placeholder',
      statusLines: [
        '- Closed [`spec/02_completed-session.md`](./spec/02_completed-session.md) as done and activated [`spec/03_session-placeholder.md`](./spec/03_session-placeholder.md).',
      ],
      lastSessionSpec: '02_completed-session',
      lastCompletedSpec: '02_completed-session',
    });

    expect(collectErrors(repoRoot)).toEqual([]);
  });

  it('passes for a superseded last session with an older completed proof owner', () => {
    const specs: FixtureSpec[] = [
      {
        id: '02_completed-session',
        title: 'Completed session',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Last fully completed session.',
      },
      {
        id: '03_gate-a-stop',
        title: 'Superseded session',
        status: 'Superseded',
        exitCriteriaState: 'not-satisfied',
        successorSlot: '04',
        notes: 'Stopped at Gate A and rolled into slot 04.',
      },
      {
        id: '04_session-placeholder',
        title: 'Placeholder',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Active placeholder.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      currentSpec: '04_session-placeholder',
      statusLines: [
        '- Closed [`spec/03_gate-a-stop.md`](./spec/03_gate-a-stop.md) as superseded and activated [`spec/04_session-placeholder.md`](./spec/04_session-placeholder.md).',
      ],
      lastSessionSpec: '03_gate-a-stop',
      lastCompletedSpec: '02_completed-session',
    });

    expect(collectErrors(repoRoot)).toEqual([]);
  });

  it('fails when a done spec has non-satisfied exit criteria', () => {
    const specs: FixtureSpec[] = [
      {
        id: '02_bad-done-session',
        title: 'Bad done session',
        status: 'Done',
        exitCriteriaState: 'not-satisfied',
        successorSlot: 'none',
        notes: 'Incorrect terminal metadata.',
      },
      {
        id: '03_session-placeholder',
        title: 'Placeholder',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Active placeholder.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      currentSpec: '03_session-placeholder',
      lastSessionSpec: '02_bad-done-session',
      lastCompletedSpec: '02_bad-done-session',
    });

    expect(collectErrors(repoRoot)).toContain(
      'spec/02_bad-done-session.md: Done specs must use `Exit Criteria State: satisfied`.'
    );
  });
});

describe('collectExecutionArtifactErrors - invalid ledgers', () => {
  it('fails when a superseded spec has no successor slot', () => {
    const specs: FixtureSpec[] = [
      {
        id: '02_completed-session',
        title: 'Completed session',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Completed cleanly.',
      },
      {
        id: '03_bad-superseded',
        title: 'Superseded session',
        status: 'Superseded',
        exitCriteriaState: 'not-satisfied',
        successorSlot: 'none',
        notes: 'Missing successor slot.',
      },
      {
        id: '04_session-placeholder',
        title: 'Placeholder',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Active placeholder.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      currentSpec: '04_session-placeholder',
      lastSessionSpec: '03_bad-superseded',
      lastCompletedSpec: '02_completed-session',
    });

    expect(collectErrors(repoRoot)).toContain(
      'spec/03_bad-superseded.md: Superseded specs must point to a real successor slot.'
    );
  });

  it('fails when a placeholder is active without Last Session Spec', () => {
    const specs: FixtureSpec[] = [
      {
        id: '02_completed-session',
        title: 'Completed session',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Completed cleanly.',
      },
      {
        id: '03_session-placeholder',
        title: 'Placeholder',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Active placeholder.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      currentSpec: '03_session-placeholder',
      lastCompletedSpec: '02_completed-session',
    });

    expect(collectErrors(repoRoot)).toContain(
      'progress.md: missing required heading -> ## Last Session Spec'
    );
  });

  it('fails when Last Completed Spec points to a superseded session', () => {
    const specs: FixtureSpec[] = [
      {
        id: '02_completed-session',
        title: 'Completed session',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Completed cleanly.',
      },
      {
        id: '03_gate-a-stop',
        title: 'Superseded session',
        status: 'Superseded',
        exitCriteriaState: 'not-satisfied',
        successorSlot: '04',
        notes: 'Superseded at Gate A.',
      },
      {
        id: '04_session-placeholder',
        title: 'Placeholder',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Active placeholder.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      currentSpec: '04_session-placeholder',
      lastSessionSpec: '03_gate-a-stop',
      lastCompletedSpec: '03_gate-a-stop',
    });

    expect(collectErrors(repoRoot)).toContain(
      'progress.md: superseded `## Last Session Spec` (03_gate-a-stop) cannot also be `## Last Completed Spec`.'
    );
  });

  it('fails when Napkin Evidence is vague', () => {
    const specs: FixtureSpec[] = [
      {
        id: '02_completed-session',
        title: 'Completed session',
        status: 'Done',
        exitCriteriaState: 'satisfied',
        successorSlot: 'none',
        notes: 'Completed cleanly.',
      },
      {
        id: '03_session-placeholder',
        title: 'Placeholder',
        status: 'Active',
        exitCriteriaState: 'pending',
        successorSlot: 'none',
        notes: 'Active placeholder.',
      },
    ];

    const repoRoot = createFixtureRepo(specs, {
      currentSpec: '03_session-placeholder',
      lastSessionSpec: '02_completed-session',
      lastCompletedSpec: '02_completed-session',
      napkinEvidence: ['- Reviewed the napkin.'],
    });

    expect(collectErrors(repoRoot)).toContain(
      'progress.md: `## Napkin Evidence` must link `docs/napkin/napkin.md` or say `No durable napkin update.`.'
    );
  });
});
