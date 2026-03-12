import fs from 'fs';
import path from 'path';

import {
  REQUIRED_PROGRESS_HEADINGS,
  REQUIRED_SPEC_HEADINGS,
  TERMINAL_SPEC_STATUSES,
  VALID_SPEC_STATUSES,
  hasHeading,
  isNumberedSpecFile,
  isPlaceholderSpecId,
  listedSpecs,
  parseFinalState,
  referencedSpecIds,
  resolveProgressSpecId,
  sectionBody,
  validateFinalState,
} from './execution-artifact-audit-helpers.mjs';

const validateRequiredArtifacts = (requiredPaths, errors, repoRelative) => {
  for (const requiredPath of requiredPaths) {
    if (!fs.existsSync(requiredPath)) {
      errors.push(`${repoRelative(requiredPath)}: required execution artifact is missing.`);
    }
  }
};

const validateProgressStatus = (statusSection, currentSpecId, lastSessionSpecId, errors) => {
  if (!currentSpecId || !isPlaceholderSpecId(currentSpecId)) {
    return;
  }

  const mentionedSpecIds = referencedSpecIds(statusSection).filter((specId) => specId !== currentSpecId);
  const mentionsClosure = /\b(closed|completed|finished|superseded|stopped|handoff)\b/i.test(statusSection);

  if (mentionedSpecIds.length > 0 && !lastSessionSpecId) {
    errors.push(
      'progress.md: placeholder-active `## Status` references a closed session but `## Last Session Spec` is missing.'
    );
    return;
  }

  if (mentionsClosure && lastSessionSpecId && mentionedSpecIds.length > 0 && !mentionedSpecIds.includes(lastSessionSpecId)) {
    errors.push(
      `progress.md: placeholder-active \`## Status\` must reference \`## Last Session Spec\` (${lastSessionSpecId}) when describing the most recent closed session.`
    );
  }
};

const hasSubstantiveNarrative = (section) =>
  section.split('\n').some((line) => {
    const trimmed = line.trim();
    return Boolean(trimmed && trimmed !== '-' && trimmed !== '*');
  });

const validateNapkinEvidence = (progressText, errors) => {
  const napkinEvidence = sectionBody(progressText, 'Napkin Evidence');
  if (napkinEvidence === null) {
    return;
  }

  if (!hasSubstantiveNarrative(napkinEvidence)) {
    errors.push('progress.md: `## Napkin Evidence` must describe the closed session napkin outcome.');
    return;
  }

  const normalized = napkinEvidence.toLowerCase();
  if (!normalized.includes('docs/napkin/napkin.md') && !normalized.includes('no durable napkin update.')) {
    errors.push(
      'progress.md: `## Napkin Evidence` must link `docs/napkin/napkin.md` or say `No durable napkin update.`.'
    );
  }
};

const validateProgressArtifact = (progressPath, errors) => {
  if (!fs.existsSync(progressPath)) {
    return { currentSpecId: null, lastSessionSpecId: null, lastCompletedSpecId: null };
  }

  const progressText = fs.readFileSync(progressPath, 'utf8');
  for (const heading of REQUIRED_PROGRESS_HEADINGS) {
    if (!hasHeading(progressText, heading)) {
      errors.push(`progress.md: missing required heading -> ## ${heading}`);
    }
  }

  const currentSpecId = resolveProgressSpecId(progressText, 'Current Spec', errors);
  const lastSessionSpecId = resolveProgressSpecId(progressText, 'Last Session Spec', errors);
  const lastCompletedSpecId = resolveProgressSpecId(progressText, 'Last Completed Spec', errors);

  validateProgressStatus(sectionBody(progressText, 'Status') ?? '', currentSpecId, lastSessionSpecId, errors);
  validateNapkinEvidence(progressText, errors);

  if (currentSpecId && lastSessionSpecId && currentSpecId === lastSessionSpecId) {
    errors.push('progress.md: `## Last Session Spec` must not match `## Current Spec`.');
  }

  if (currentSpecId && lastCompletedSpecId && currentSpecId === lastCompletedSpecId) {
    errors.push('progress.md: `## Last Completed Spec` must not match `## Current Spec`.');
  }

  return { currentSpecId, lastSessionSpecId, lastCompletedSpecId };
};

const readActualSpecIds = (specDirPath) => {
  if (!fs.existsSync(specDirPath)) {
    return [];
  }

  return fs
    .readdirSync(specDirPath)
    .filter((name) => isNumberedSpecFile(name))
    .map((name) => name.replace(/\.md$/, ''))
    .sort();
};

const validateSpecFiles = (specDirPath, actualSpecIds, errors) => {
  const specStates = new Map();

  for (const specId of actualSpecIds) {
    const fullPath = path.join(specDirPath, `${specId}.md`);
    const text = fs.readFileSync(fullPath, 'utf8');

    for (const heading of REQUIRED_SPEC_HEADINGS) {
      if (!hasHeading(text, heading)) {
        errors.push(`spec/${specId}.md: missing required heading -> ## ${heading}`);
      }
    }

    const finalState = parseFinalState(specId, text, errors);
    validateFinalState(specId, finalState, actualSpecIds, errors);
    if (finalState) {
      specStates.set(specId, finalState);
    }
  }

  return specStates;
};

const collectOverviewState = (overviewText, actualSpecIds, specStates, errors) => {
  const overviewSpecs = listedSpecs(overviewText);
  const overviewIds = [...overviewSpecs.keys()].sort();
  const activeOverviewIds = [];

  for (const specId of actualSpecIds.filter((id) => !overviewIds.includes(id))) {
    errors.push(`spec/00_overview.md: missing row for ${specId}.`);
  }

  for (const specId of overviewIds.filter((id) => !actualSpecIds.includes(id))) {
    errors.push(`spec/00_overview.md: lists missing numbered spec ${specId}.`);
  }

  for (const [specId, { status }] of overviewSpecs.entries()) {
    if (!VALID_SPEC_STATUSES.has(status)) {
      errors.push(
        `spec/00_overview.md: ${specId} has invalid status (${status}). Use Active, Done, or Superseded.`
      );
    }

    if (status === 'Active') {
      activeOverviewIds.push(specId);
    }

    const finalStatus = specStates.get(specId)?.status;
    if (finalStatus && finalStatus !== status) {
      errors.push(
        `spec/00_overview.md: ${specId} row status (${status}) must match spec Final State (${finalStatus}).`
      );
    }
  }

  if (activeOverviewIds.length !== 1) {
    errors.push(
      `spec/00_overview.md: must contain exactly one Active spec row; found ${activeOverviewIds.length}.`
    );
  }

  return { overviewSpecs, activeOverviewIds };
};

const validateCurrentSpec = (
  currentSpecId,
  actualSpecIds,
  overviewSpecs,
  activeOverviewIds,
  specStates,
  errors
) => {
  if (!currentSpecId) return;

  if (!actualSpecIds.includes(currentSpecId)) {
    errors.push(`progress.md: current spec ${currentSpecId} does not exist in spec/.`);
    return;
  }

  if (!overviewSpecs.has(currentSpecId)) {
    errors.push(`progress.md: current spec ${currentSpecId} is missing from spec/00_overview.md.`);
    return;
  }

  if (overviewSpecs.get(currentSpecId)?.status !== 'Active') {
    errors.push(`progress.md: current spec ${currentSpecId} must be marked Active in spec/00_overview.md.`);
  }

  if (activeOverviewIds.length === 1 && activeOverviewIds[0] !== currentSpecId) {
    errors.push(
      `progress.md: current spec ${currentSpecId} does not match the Active overview row ${activeOverviewIds[0]}.`
    );
  }

  if (specStates.get(currentSpecId)?.status !== 'Active') {
    errors.push(`progress.md: current spec ${currentSpecId} must have \`Final State -> Status: Active\`.`);
  }
};

const validateLastSessionSpec = (
  currentSpecId,
  lastSessionSpecId,
  actualSpecIds,
  overviewSpecs,
  specStates,
  errors
) => {
  if (!lastSessionSpecId) return;

  if (!actualSpecIds.includes(lastSessionSpecId)) {
    errors.push(`progress.md: last session spec ${lastSessionSpecId} does not exist in spec/.`);
    return;
  }

  if (!overviewSpecs.has(lastSessionSpecId)) {
    errors.push(`progress.md: last session spec ${lastSessionSpecId} is missing from spec/00_overview.md.`);
    return;
  }

  const overviewStatus = overviewSpecs.get(lastSessionSpecId)?.status;
  const finalStatus = specStates.get(lastSessionSpecId)?.status;

  if (!TERMINAL_SPEC_STATUSES.has(overviewStatus)) {
    errors.push(
      `progress.md: last session spec ${lastSessionSpecId} must be marked Done or Superseded in spec/00_overview.md.`
    );
  }

  if (!TERMINAL_SPEC_STATUSES.has(finalStatus)) {
    errors.push(
      `progress.md: last session spec ${lastSessionSpecId} must be terminal in its Final State metadata.`
    );
  }

  if (currentSpecId && isPlaceholderSpecId(currentSpecId) && !TERMINAL_SPEC_STATUSES.has(finalStatus)) {
    errors.push(
      `progress.md: placeholder-active current spec ${currentSpecId} requires a terminal \`## Last Session Spec\`.`
    );
  }
};

const validateLastCompletedSpec = (
  lastCompletedSpecId,
  actualSpecIds,
  overviewSpecs,
  specStates,
  errors
) => {
  if (!lastCompletedSpecId) return;

  if (!actualSpecIds.includes(lastCompletedSpecId)) {
    errors.push(`progress.md: last completed spec ${lastCompletedSpecId} does not exist in spec/.`);
    return;
  }

  if (!overviewSpecs.has(lastCompletedSpecId)) {
    errors.push(`progress.md: last completed spec ${lastCompletedSpecId} is missing from spec/00_overview.md.`);
    return;
  }

  if (overviewSpecs.get(lastCompletedSpecId)?.status !== 'Done') {
    errors.push(`progress.md: last completed spec ${lastCompletedSpecId} must be marked Done in spec/00_overview.md.`);
  }

  if (specStates.get(lastCompletedSpecId)?.status !== 'Done') {
    errors.push(
      `progress.md: last completed spec ${lastCompletedSpecId} must use \`Final State -> Status: Done\`.`
    );
  }
};

const validateProgressRelationships = (
  currentSpecId,
  lastSessionSpecId,
  lastCompletedSpecId,
  specStates,
  errors
) => {
  if (!lastSessionSpecId || !lastCompletedSpecId) return;

  const lastSessionStatus = specStates.get(lastSessionSpecId)?.status;
  const lastCompletedStatus = specStates.get(lastCompletedSpecId)?.status;

  if (lastSessionStatus === 'Done' && lastCompletedSpecId !== lastSessionSpecId) {
    errors.push(
      `progress.md: when \`## Last Session Spec\` (${lastSessionSpecId}) is Done, \`## Last Completed Spec\` must match it.`
    );
  }

  if (lastSessionStatus === 'Superseded' && lastCompletedSpecId === lastSessionSpecId) {
    errors.push(
      `progress.md: superseded \`## Last Session Spec\` (${lastSessionSpecId}) cannot also be \`## Last Completed Spec\`.`
    );
  }

  if (currentSpecId && isPlaceholderSpecId(currentSpecId) && lastCompletedStatus !== 'Done') {
    errors.push(
      'progress.md: placeholder-active current spec requires `## Last Completed Spec` to point at a Done session.'
    );
  }
};

const validateSpecOverview = (
  specOverviewPath,
  actualSpecIds,
  currentSpecId,
  lastSessionSpecId,
  lastCompletedSpecId,
  specStates,
  errors
) => {
  if (!fs.existsSync(specOverviewPath)) return;

  const overviewText = fs.readFileSync(specOverviewPath, 'utf8');
  const { overviewSpecs, activeOverviewIds } = collectOverviewState(
    overviewText,
    actualSpecIds,
    specStates,
    errors
  );

  validateCurrentSpec(currentSpecId, actualSpecIds, overviewSpecs, activeOverviewIds, specStates, errors);
  validateLastSessionSpec(
    currentSpecId,
    lastSessionSpecId,
    actualSpecIds,
    overviewSpecs,
    specStates,
    errors
  );
  validateLastCompletedSpec(lastCompletedSpecId, actualSpecIds, overviewSpecs, specStates, errors);
  validateProgressRelationships(currentSpecId, lastSessionSpecId, lastCompletedSpecId, specStates, errors);
};

export const collectExecutionArtifactErrors = ({ repoRoot, repoRelative }) => {
  const progressPath = path.join(repoRoot, 'progress.md');
  const specDirPath = path.join(repoRoot, 'spec');
  const specOverviewPath = path.join(specDirPath, '00_overview.md');
  const specTemplatePath = path.join(specDirPath, 'SPEC_TEMPLATE.md');
  const errors = [];

  validateRequiredArtifacts([progressPath, specOverviewPath, specTemplatePath], errors, repoRelative);

  const { currentSpecId, lastSessionSpecId, lastCompletedSpecId } = validateProgressArtifact(
    progressPath,
    errors
  );
  const actualSpecIds = readActualSpecIds(specDirPath);
  const specStates = validateSpecFiles(specDirPath, actualSpecIds, errors);

  validateSpecOverview(
    specOverviewPath,
    actualSpecIds,
    currentSpecId,
    lastSessionSpecId,
    lastCompletedSpecId,
    specStates,
    errors
  );

  return errors;
};
