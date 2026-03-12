import fs from 'fs';
import path from 'path';

const NUMBERED_SPEC_FILE = /^\d{2}_.+\.md$/;
const NUMBERED_SPEC_ID = /^\d{2}_.+$/;
const REQUIRED_PROGRESS_HEADINGS = [
  'Current Spec',
  'Current Stage',
  'Status',
  'Blockers',
  'Next Step',
  'Last Completed Spec',
  'Last Green Commands',
  'Dogfood Evidence',
];
const REQUIRED_SPEC_HEADINGS = [
  'Objective',
  'In Scope',
  'Out Of Scope',
  'Dependencies',
  'Stage Plan',
  'Test Gate',
  'Exit Criteria',
];
const VALID_SPEC_STATUSES = new Set(['Active', 'Done']);
const PLACEHOLDER_SPEC_SUFFIX = '_session-placeholder';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasHeading = (text, heading) => new RegExp(`^## ${escapeRegExp(heading)}$`, 'm').test(text);

const sectionBody = (text, heading) => {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line === `## ${heading}`);
  if (start === -1) return null;

  let end = start + 1;
  while (end < lines.length && !lines[end].startsWith('## ')) {
    end += 1;
  }

  return lines.slice(start + 1, end).join('\n');
};

const backtickedValues = (text) => {
  const values = [];
  const regex = /`([^`]+)`/g;
  let match;
  while ((match = regex.exec(text))) {
    values.push(match[1]);
  }
  return values;
};

const singleBacktickedSpecId = (text) => {
  const tokens = backtickedValues(text).filter((value) => NUMBERED_SPEC_ID.test(value));
  return tokens.length === 1 ? tokens[0] : null;
};

const isPlaceholderSpecId = (specId) => specId.endsWith(PLACEHOLDER_SPEC_SUFFIX);

const listedSpecs = (overviewText) => {
  const specs = new Map();

  for (const line of overviewText.split('\n')) {
    if (!/^\| `\d{2}_[^`]+` \|/.test(line)) continue;

    const cells = line.split('|').map((cell) => cell.trim());
    const specId = cells[1]?.replace(/^`|`$/g, '');
    const status = cells[3];

    if (specId) {
      specs.set(specId, { status });
    }
  }

  return specs;
};

const isNumberedSpecFile = (name) => NUMBERED_SPEC_FILE.test(name) && name !== '00_overview.md';

const validateRequiredArtifacts = (requiredPaths, errors, repoRelative) => {
  for (const requiredPath of requiredPaths) {
    if (!fs.existsSync(requiredPath)) {
      errors.push(`${repoRelative(requiredPath)}: required execution artifact is missing.`);
    }
  }
};

const resolveProgressSpecId = (progressText, heading, errors) => {
  const section = sectionBody(progressText, heading);
  if (section === null) {
    errors.push(`progress.md: missing \`## ${heading}\` section body.`);
    return null;
  }

  const resolvedSpecId = singleBacktickedSpecId(section);
  if (!resolvedSpecId) {
    errors.push(`progress.md: \`## ${heading}\` must contain exactly one backticked numbered spec id.`);
    return null;
  }

  return resolvedSpecId;
};

const validatePlaceholderStatus = (statusSection, currentSpecId, errors) => {
  if (
    currentSpecId &&
    isPlaceholderSpecId(currentSpecId) &&
    /Completed\s+(?:\[`spec\/\d{2}_[^`]+\.md`\]|\`\d{2}_[^`]+\`)/.test(statusSection)
  ) {
    errors.push(
      'progress.md: placeholder-active `## Status` must not claim completion of another spec; move that proof to `## Last Completed Spec`.'
    );
  }
};

const validateProgressArtifact = (progressPath, errors) => {
  if (!fs.existsSync(progressPath)) {
    return { currentSpecId: null, lastCompletedSpecId: null };
  }

  const progressText = fs.readFileSync(progressPath, 'utf8');
  for (const heading of REQUIRED_PROGRESS_HEADINGS) {
    if (!hasHeading(progressText, heading)) {
      errors.push(`progress.md: missing required heading -> ## ${heading}`);
    }
  }

  const currentSpecId = resolveProgressSpecId(progressText, 'Current Spec', errors);
  const lastCompletedSpecId = resolveProgressSpecId(progressText, 'Last Completed Spec', errors);
  const statusSection = sectionBody(progressText, 'Status') ?? '';
  validatePlaceholderStatus(statusSection, currentSpecId, errors);

  if (currentSpecId && lastCompletedSpecId && currentSpecId === lastCompletedSpecId) {
    errors.push('progress.md: `## Last Completed Spec` must not match `## Current Spec`.');
  }

  return { currentSpecId, lastCompletedSpecId };
};

const readActualSpecIds = (specDirPath) => {
  let actualSpecIds = [];
  if (fs.existsSync(specDirPath)) {
    actualSpecIds = fs
      .readdirSync(specDirPath)
      .filter((name) => isNumberedSpecFile(name))
      .map((name) => name.replace(/\.md$/, ''))
      .sort();
  }

  return actualSpecIds;
};

const validateSpecFiles = (specDirPath, actualSpecIds, errors) => {
  for (const specId of actualSpecIds) {
    const fullPath = path.join(specDirPath, `${specId}.md`);
    const text = fs.readFileSync(fullPath, 'utf8');
    for (const heading of REQUIRED_SPEC_HEADINGS) {
      if (!hasHeading(text, heading)) {
        errors.push(`spec/${specId}.md: missing required heading -> ## ${heading}`);
      }
    }
  }
};

const collectOverviewState = (overviewText, actualSpecIds, errors) => {
  const overviewSpecs = listedSpecs(overviewText);
  const overviewIds = [...overviewSpecs.keys()].sort();
  const missingFromOverview = actualSpecIds.filter((id) => !overviewIds.includes(id));
  const extraInOverview = overviewIds.filter((id) => !actualSpecIds.includes(id));
  const activeOverviewIds = [];

  for (const specId of missingFromOverview) {
    errors.push(`spec/00_overview.md: missing row for ${specId}.`);
  }
  for (const specId of extraInOverview) {
    errors.push(`spec/00_overview.md: lists missing numbered spec ${specId}.`);
  }

  for (const [specId, { status }] of overviewSpecs.entries()) {
    if (!VALID_SPEC_STATUSES.has(status)) {
      errors.push(`spec/00_overview.md: ${specId} has invalid status (${status}). Use Active or Done.`);
    }
    if (status === 'Active') {
      activeOverviewIds.push(specId);
    }
  }

  if (activeOverviewIds.length !== 1) {
    errors.push(
      `spec/00_overview.md: must contain exactly one Active spec row; found ${activeOverviewIds.length}.`
    );
  }

  return { overviewSpecs, activeOverviewIds };
};

const validateCurrentSpecAgainstOverview = (
  currentSpecId,
  actualSpecIds,
  overviewSpecs,
  activeOverviewIds,
  errors
) => {
  if (!currentSpecId) {
    return;
  }

  if (!actualSpecIds.includes(currentSpecId)) {
    errors.push(`progress.md: current spec ${currentSpecId} does not exist in spec/.`);
  } else if (!overviewSpecs.has(currentSpecId)) {
    errors.push(`progress.md: current spec ${currentSpecId} is missing from spec/00_overview.md.`);
  } else if (overviewSpecs.get(currentSpecId)?.status !== 'Active') {
    errors.push(`progress.md: current spec ${currentSpecId} must be marked Active in spec/00_overview.md.`);
  } else if (activeOverviewIds.length === 1 && activeOverviewIds[0] !== currentSpecId) {
    errors.push(
      `progress.md: current spec ${currentSpecId} does not match the Active overview row ${activeOverviewIds[0]}.`
    );
  }
};

const validateLastCompletedSpecAgainstOverview = (
  lastCompletedSpecId,
  actualSpecIds,
  overviewSpecs,
  errors
) => {
  if (!lastCompletedSpecId) {
    return;
  }

  if (!actualSpecIds.includes(lastCompletedSpecId)) {
    errors.push(`progress.md: last completed spec ${lastCompletedSpecId} does not exist in spec/.`);
  } else if (!overviewSpecs.has(lastCompletedSpecId)) {
    errors.push(`progress.md: last completed spec ${lastCompletedSpecId} is missing from spec/00_overview.md.`);
  } else if (overviewSpecs.get(lastCompletedSpecId)?.status !== 'Done') {
    errors.push(`progress.md: last completed spec ${lastCompletedSpecId} must be marked Done in spec/00_overview.md.`);
  }
};

const validateSpecOverview = (
  specOverviewPath,
  actualSpecIds,
  currentSpecId,
  lastCompletedSpecId,
  errors
) => {
  if (!fs.existsSync(specOverviewPath)) {
    return;
  }

  const overviewText = fs.readFileSync(specOverviewPath, 'utf8');
  const { overviewSpecs, activeOverviewIds } = collectOverviewState(overviewText, actualSpecIds, errors);
  validateCurrentSpecAgainstOverview(currentSpecId, actualSpecIds, overviewSpecs, activeOverviewIds, errors);
  validateLastCompletedSpecAgainstOverview(lastCompletedSpecId, actualSpecIds, overviewSpecs, errors);
};

export const collectExecutionArtifactErrors = ({ repoRoot, repoRelative }) => {
  const progressPath = path.join(repoRoot, 'progress.md');
  const specDirPath = path.join(repoRoot, 'spec');
  const specOverviewPath = path.join(specDirPath, '00_overview.md');
  const specTemplatePath = path.join(specDirPath, 'SPEC_TEMPLATE.md');
  const errors = [];

  validateRequiredArtifacts([progressPath, specOverviewPath, specTemplatePath], errors, repoRelative);

  const { currentSpecId, lastCompletedSpecId } = validateProgressArtifact(progressPath, errors);
  const actualSpecIds = readActualSpecIds(specDirPath);
  validateSpecFiles(specDirPath, actualSpecIds, errors);
  validateSpecOverview(specOverviewPath, actualSpecIds, currentSpecId, lastCompletedSpecId, errors);

  return errors;
};
