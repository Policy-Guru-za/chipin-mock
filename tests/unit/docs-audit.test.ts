import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { classifyDoc } from '../../scripts/docs/control-matrix.mjs';
import { collectDocs, collectDocsWithMetadata } from '../../scripts/docs/audit.mjs';

const tempDirs: string[] = [];

const createTempRepo = () => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'gifta-docs-audit-'));
  tempDirs.push(repoRoot);
  return repoRoot;
};

const writeDoc = (repoRoot: string, relativePath: string, contents = '# Test\n') => {
  const fullPath = path.join(repoRoot, relativePath);
  mkdirSync(path.dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, contents);
  return fullPath;
};

const toRelativePaths = (repoRoot: string, filePaths: string[]) =>
  filePaths.map((filePath) => path.relative(repoRoot, filePath).split(path.sep).join('/'));

afterEach(() => {
  while (tempDirs.length > 0) {
    const repoRoot = tempDirs.pop();
    if (repoRoot) {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  }
});

describe('docs audit helpers', () => {
  it('excludes tmp and .reference markdown from docs governance scope', () => {
    const repoRoot = createTempRepo();
    writeDoc(repoRoot, 'AGENTS.md');
    writeDoc(repoRoot, 'tmp/gifta-react/README.md');
    writeDoc(repoRoot, '.reference/upstream/README.md');

    const docs = collectDocs(repoRoot, { repoRoot });
    const relativePaths = toRelativePaths(repoRoot, docs);

    expect(relativePaths).toContain('AGENTS.md');
    expect(relativePaths).not.toContain('tmp/gifta-react/README.md');
    expect(relativePaths).not.toContain('.reference/upstream/README.md');
  });

  it('reports CLAUDE.md as a retired root doc with an explicit message', () => {
    const repoRoot = createTempRepo();
    const claudePath = writeDoc(repoRoot, 'CLAUDE.md');

    const result = collectDocsWithMetadata([claudePath], { repoRoot });

    expect(result.docsWithMetadata).toHaveLength(0);
    expect(result.errors).toEqual(['CLAUDE.md: retired root doc; use AGENTS.md.']);
  });

  it('keeps governed root docs classifiable', () => {
    const repoRoot = createTempRepo();
    const agentsPath = writeDoc(repoRoot, 'AGENTS.md');

    const result = collectDocsWithMetadata([agentsPath], { repoRoot });

    expect(result.errors).toEqual([]);
    expect(result.docsWithMetadata).toHaveLength(1);
    expect(result.docsWithMetadata[0]?.path).toBe('AGENTS.md');
    expect(result.docsWithMetadata[0]?.metadata.status).toBe('current-operational');
  });

  it('classifies active numbered specs as operational and closed specs as reference', () => {
    const repoRoot = createTempRepo();
    const activeSpecPath = writeDoc(
      repoRoot,
      'spec/40_parallel-workflow-refactor.md',
      '# 40_parallel-workflow-refactor\n\n## Final State\n\n- Status: Active\n- Exit Criteria State: pending\n- Successor Slot: none\n- Notes: Active spec.\n'
    );
    const doneSpecPath = writeDoc(
      repoRoot,
      'spec/39_finished-task.md',
      '# 39_finished-task\n\n## Final State\n\n- Status: Done\n- Exit Criteria State: satisfied\n- Successor Slot: none\n- Notes: Done spec.\n'
    );

    expect(classifyDoc(activeSpecPath, { cwd: repoRoot })?.status).toBe('current-operational');
    expect(classifyDoc(doneSpecPath, { cwd: repoRoot })?.status).toBe('current-reference');
  });

  it('surfaces actionable errors for unsupported markdown still inside docs audit scope', () => {
    const repoRoot = createTempRepo();
    const notesPath = writeDoc(repoRoot, 'notes/random.md');

    const result = collectDocsWithMetadata([notesPath], { repoRoot });

    expect(result.docsWithMetadata).toHaveLength(0);
    expect(result.errors).toEqual([
      'notes/random.md: markdown file is in docs:audit scope but has no control-matrix rule. Either exclude its directory from docs governance or classify it in scripts/docs/control-matrix.mjs.',
    ]);
  });

  it('keeps README on the napkin-first startup contract before AGENTS delegation', () => {
    const readme = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');

    expect(readme).toContain('.agents/skills/napkin/SKILL.md');
    expect(readme).toContain('docs/napkin/napkin.md');
    expect(readme).toContain('AGENTS.md');
  });

  it('keeps the review playbook aligned with napkin-first startup', () => {
    const playbook = readFileSync(new URL('../../docs/agent-playbooks/code_review.md', import.meta.url), 'utf8');

    expect(playbook).toContain('.agents/skills/napkin/SKILL.md');
    expect(playbook).toContain('docs/napkin/napkin.md');
    expect(playbook).toContain('AGENTS.md');
  });
});
