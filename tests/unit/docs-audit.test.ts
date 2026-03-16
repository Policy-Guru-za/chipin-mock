import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

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

  it('surfaces actionable errors for unsupported markdown still inside docs audit scope', () => {
    const repoRoot = createTempRepo();
    const notesPath = writeDoc(repoRoot, 'notes/random.md');

    const result = collectDocsWithMetadata([notesPath], { repoRoot });

    expect(result.docsWithMetadata).toHaveLength(0);
    expect(result.errors).toEqual([
      'notes/random.md: markdown file is in docs:audit scope but has no control-matrix rule. Either exclude its directory from docs governance or classify it in scripts/docs/control-matrix.mjs.',
    ]);
  });
});
