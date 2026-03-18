import fs from 'fs';
import path from 'path';

import {
  CLOSED_AT_REQUIRED_FROM_SLOT,
  REQUIRED_ACTIVE_SPEC_COLUMNS,
  REQUIRED_OVERVIEW_COLUMNS,
  REQUIRED_PROGRESS_HEADINGS,
  REQUIRED_QUICK_TASK_COLUMNS,
  REQUIRED_SPEC_HEADINGS,
  TERMINAL_SPEC_STATUSES,
  VALID_SPEC_STATUSES,
  hasHeading,
  isExplicitNone,
  isValidClosedAt,
  isNumberedSpecFile,
  listedSpecs,
  parseFinalState,
  parseMarkdownTable,
  parseRecentlyClosedEntries,
  referencedSpecIds,
  resolveProgressSpecId,
  specSlot,
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

const hasSubstantiveNarrative = (section) =>
  section.split('\n').some((line) => {
    const trimmed = line.trim();
    return Boolean(trimmed && trimmed !== '-' && trimmed !== '*');
  });

const validateNarrativeSection = (progressText, heading, errors) => {
  const section = sectionBody(progressText, heading);
  if (section === null) return;

  if (!hasSubstantiveNarrative(section)) {
    errors.push(`progress.md: \`## ${heading}\` must contain substantive evidence.`);
  }
};

const validateNapkinEvidence = (progressText, errors) => {
  const napkinEvidence = sectionBody(progressText, 'Napkin Evidence');
  if (napkinEvidence === null) {
    return;
  }

  if (!hasSubstantiveNarrative(napkinEvidence)) {
    errors.push('progress.md: `## Napkin Evidence` must describe the latest napkin outcome.');
    return;
  }

  const normalized = napkinEvidence.toLowerCase();
  if (!normalized.includes('docs/napkin/napkin.md') && !normalized.includes('no durable napkin update.')) {
    errors.push(
      'progress.md: `## Napkin Evidence` must link `docs/napkin/napkin.md` or say `No durable napkin update.`.'
    );
  }
};

const validateTableSection = (progressText, heading, requiredColumns, errors) => {
  const section = sectionBody(progressText, heading);
  if (section === null) {
    return { rows: [], isNone: false };
  }

  if (isExplicitNone(section)) {
    return { rows: [], isNone: true };
  }

  const { headers, rows } = parseMarkdownTable(section);
  if (headers.length === 0) {
    errors.push(`progress.md: \`## ${heading}\` must contain a markdown table or \`- None.\`.`);
    return { rows: [], isNone: false };
  }

  for (const column of requiredColumns) {
    if (!headers.includes(column)) {
      errors.push(`progress.md: \`## ${heading}\` is missing required table column (${column}).`);
    }
  }

  return { rows, isNone: false };
};

const validateActiveSpecRows = (progressText, errors) => {
  const { rows } = validateTableSection(progressText, 'Active Full Specs', REQUIRED_ACTIVE_SPEC_COLUMNS, errors);
  const activeProgressSpecIds = [];

  rows.forEach((row, index) => {
    const specIds = referencedSpecIds(row.Spec ?? '');
    if (specIds.length !== 1) {
      errors.push(
        `progress.md: \`## Active Full Specs\` row ${index + 1} must contain exactly one backticked numbered spec id in the Spec column.`
      );
      return;
    }

    activeProgressSpecIds.push(specIds[0]);
  });

  return activeProgressSpecIds;
};

const validateQuickTasks = (progressText, errors) => {
  validateTableSection(progressText, 'Quick Tasks', REQUIRED_QUICK_TASK_COLUMNS, errors);
};

const validateRecentlyClosedSpecs = (progressText, errors) => {
  const section = sectionBody(progressText, 'Recently Closed Specs');
  if (section === null) return [];

  if (isExplicitNone(section)) {
    return [];
  }

  if (!hasSubstantiveNarrative(section)) {
    errors.push('progress.md: `## Recently Closed Specs` must list terminal specs or `- None.`.');
    return [];
  }

  const { entries, invalidLines } = parseRecentlyClosedEntries(section);
  if (invalidLines.length > 0) {
    errors.push(
      'progress.md: `## Recently Closed Specs` entries must be bullet lines with a primary backticked numbered spec id.'
    );
  }

  if (entries.length === 0) {
    errors.push('progress.md: `## Recently Closed Specs` must reference backticked numbered spec ids or `- None.`.');
  }

  return entries.map((entry) => entry.primarySpecId);
};

const validateProgressArtifact = (progressPath, errors) => {
  if (!fs.existsSync(progressPath)) {
    return { activeProgressSpecIds: [], recentlyClosedSpecIds: [], lastCompletedSpecId: null };
  }

  const progressText = fs.readFileSync(progressPath, 'utf8');
  for (const heading of REQUIRED_PROGRESS_HEADINGS) {
    if (!hasHeading(progressText, heading)) {
      errors.push(`progress.md: missing required heading -> ## ${heading}`);
    }
  }

  const activeProgressSpecIds = validateActiveSpecRows(progressText, errors);
  validateQuickTasks(progressText, errors);
  const recentlyClosedSpecIds = validateRecentlyClosedSpecs(progressText, errors);
  const lastCompletedSpecId = resolveProgressSpecId(progressText, 'Last Completed Spec', errors);

  validateNarrativeSection(progressText, 'Last Green Commands', errors);
  validateNarrativeSection(progressText, 'Dogfood Evidence', errors);
  validateNapkinEvidence(progressText, errors);

  return { activeProgressSpecIds, recentlyClosedSpecIds, lastCompletedSpecId };
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

const requiresClosedAt = (specId) => specSlot(specId) >= CLOSED_AT_REQUIRED_FROM_SLOT;

const newestTimestampedSpecId = (overviewSpecs, predicate) => {
  const candidates = [...overviewSpecs.entries()]
    .filter(([specId, entry]) => entry.closedAt && predicate(entry, specId))
    .sort((left, right) => {
      const timeDelta = Date.parse(right[1].closedAt) - Date.parse(left[1].closedAt);
      if (timeDelta !== 0) return timeDelta;
      return right[0].localeCompare(left[0]);
    });

  return candidates[0]?.[0] ?? null;
};

const collectOverviewState = (overviewText, actualSpecIds, specStates, errors) => {
  const { headers, specs: overviewSpecs } = listedSpecs(overviewText);
  const overviewIds = [...overviewSpecs.keys()].sort();
  const activeOverviewIds = [];

  for (const column of REQUIRED_OVERVIEW_COLUMNS) {
    if (!headers.includes(column)) {
      errors.push(`spec/00_overview.md: missing required table column (${column}).`);
    }
  }

  for (const specId of actualSpecIds.filter((id) => !overviewIds.includes(id))) {
    errors.push(`spec/00_overview.md: missing row for ${specId}.`);
  }

  for (const specId of overviewIds.filter((id) => !actualSpecIds.includes(id))) {
    errors.push(`spec/00_overview.md: lists missing numbered spec ${specId}.`);
  }

  for (const [specId, { status, closedAt }] of overviewSpecs.entries()) {
    if (!VALID_SPEC_STATUSES.has(status)) {
      errors.push(
        `spec/00_overview.md: ${specId} has invalid status (${status}). Use Active, Done, or Superseded.`
      );
    }

    if (status === 'Active') {
      activeOverviewIds.push(specId);
      if (closedAt) {
        errors.push(`spec/00_overview.md: Active spec ${specId} must use \`Closed At: —\`.`);
      }
    }

    if (closedAt && !isValidClosedAt(closedAt)) {
      errors.push(
        `spec/00_overview.md: ${specId} has invalid Closed At value (${closedAt}). Use UTC ISO-8601 like \`2026-03-18T12:34:56Z\`.`
      );
    }

    if (TERMINAL_SPEC_STATUSES.has(status) && requiresClosedAt(specId) && !closedAt) {
      errors.push(
        `spec/00_overview.md: terminal spec ${specId} must include \`Closed At\` once slot ${CLOSED_AT_REQUIRED_FROM_SLOT} and above adopted the new closure-order contract.`
      );
    }

    const finalStatus = specStates.get(specId)?.status;
    if (finalStatus && finalStatus !== status) {
      errors.push(
        `spec/00_overview.md: ${specId} row status (${status}) must match spec Final State (${finalStatus}).`
      );
    }
  }

  return {
    overviewSpecs,
    activeOverviewIds,
    newestTimestampedTerminalSpecId: newestTimestampedSpecId(
      overviewSpecs,
      ({ status }) => TERMINAL_SPEC_STATUSES.has(status)
    ),
    latestTimestampedDoneSpecId: newestTimestampedSpecId(overviewSpecs, ({ status }) => status === 'Done'),
  };
};

const validateActiveSpecs = (
  activeProgressSpecIds,
  activeOverviewIds,
  actualSpecIds,
  overviewSpecs,
  specStates,
  errors
) => {
  for (const specId of activeProgressSpecIds) {
    if (!actualSpecIds.includes(specId)) {
      errors.push(`progress.md: active full spec ${specId} does not exist in spec/.`);
      continue;
    }

    if (!overviewSpecs.has(specId)) {
      errors.push(`progress.md: active full spec ${specId} is missing from spec/00_overview.md.`);
      continue;
    }

    if (overviewSpecs.get(specId)?.status !== 'Active') {
      errors.push(`progress.md: active full spec ${specId} must be marked Active in spec/00_overview.md.`);
    }

    if (specStates.get(specId)?.status !== 'Active') {
      errors.push(`progress.md: active full spec ${specId} must use \`Final State -> Status: Active\`.`);
    }
  }

  for (const specId of activeOverviewIds.filter((id) => !activeProgressSpecIds.includes(id))) {
    errors.push(`progress.md: overview Active spec ${specId} must appear in \`## Active Full Specs\`.`);
  }
};

const validateRecentlyClosedSpecSet = (
  recentlyClosedSpecIds,
  activeProgressSpecIds,
  actualSpecIds,
  overviewSpecs,
  specStates,
  errors
) => {
  for (const specId of recentlyClosedSpecIds) {
    if (!actualSpecIds.includes(specId)) {
      errors.push(`progress.md: recently closed spec ${specId} does not exist in spec/.`);
      continue;
    }

    if (activeProgressSpecIds.includes(specId)) {
      errors.push(`progress.md: recently closed spec ${specId} cannot also be listed under \`## Active Full Specs\`.`);
    }

    const overviewStatus = overviewSpecs.get(specId)?.status;
    const finalStatus = specStates.get(specId)?.status;

    if (!TERMINAL_SPEC_STATUSES.has(overviewStatus)) {
      errors.push(`progress.md: recently closed spec ${specId} must be Done or Superseded in spec/00_overview.md.`);
    }

    if (!TERMINAL_SPEC_STATUSES.has(finalStatus)) {
      errors.push(`progress.md: recently closed spec ${specId} must be terminal in its Final State metadata.`);
    }
  }
};

const validateLastCompletedSpec = (
  lastCompletedSpecId,
  activeProgressSpecIds,
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

  if (activeProgressSpecIds.includes(lastCompletedSpecId)) {
    errors.push(`progress.md: last completed spec ${lastCompletedSpecId} cannot also be Active.`);
  }

  if (overviewSpecs.get(lastCompletedSpecId)?.status !== 'Done') {
    errors.push(`progress.md: last completed spec ${lastCompletedSpecId} must be marked Done in spec/00_overview.md.`);
  }

  if (specStates.get(lastCompletedSpecId)?.status !== 'Done') {
    errors.push(`progress.md: last completed spec ${lastCompletedSpecId} must use \`Final State -> Status: Done\`.`);
  }
};

const validateRecentlyClosedRelationships = (
  recentlyClosedSpecIds,
  lastCompletedSpecId,
  overviewSpecs,
  specStates,
  newestTimestampedTerminalSpecId,
  latestTimestampedDoneSpecId,
  errors
) => {
  if (newestTimestampedTerminalSpecId) {
    if (recentlyClosedSpecIds[0] !== newestTimestampedTerminalSpecId) {
      errors.push(
        `progress.md: newest recently closed entry must mirror the newest timestamped terminal spec (${newestTimestampedTerminalSpecId}).`
      );
    }

    if (latestTimestampedDoneSpecId && lastCompletedSpecId !== latestTimestampedDoneSpecId) {
      errors.push(
        `progress.md: \`## Last Completed Spec\` must match the latest timestamped Done spec (${latestTimestampedDoneSpecId}).`
      );
    }

    const newestTimestampedStatus = overviewSpecs.get(newestTimestampedTerminalSpecId)?.status;
    if (newestTimestampedStatus === 'Superseded' && lastCompletedSpecId === newestTimestampedTerminalSpecId) {
      errors.push(
        `progress.md: superseded newest recently closed spec ${newestTimestampedTerminalSpecId} cannot also be \`## Last Completed Spec\`.`
      );
    }

    return;
  }

  if (recentlyClosedSpecIds.length === 0 || !lastCompletedSpecId) return;

  const mostRecentClosedSpecId = recentlyClosedSpecIds[0];
  const mostRecentClosedStatus = specStates.get(mostRecentClosedSpecId)?.status;

  if (mostRecentClosedStatus === 'Done' && lastCompletedSpecId !== mostRecentClosedSpecId) {
    errors.push(
      `progress.md: when the newest recently closed spec (${mostRecentClosedSpecId}) is Done, \`## Last Completed Spec\` must match it.`
    );
  }

  if (mostRecentClosedStatus === 'Superseded' && lastCompletedSpecId === mostRecentClosedSpecId) {
    errors.push(
      `progress.md: superseded newest recently closed spec ${mostRecentClosedSpecId} cannot also be \`## Last Completed Spec\`.`
    );
  }
};

const validateSpecOverview = (
  specOverviewPath,
  actualSpecIds,
  activeProgressSpecIds,
  recentlyClosedSpecIds,
  lastCompletedSpecId,
  specStates,
  errors
) => {
  if (!fs.existsSync(specOverviewPath)) return;

  const overviewText = fs.readFileSync(specOverviewPath, 'utf8');
  const {
    overviewSpecs,
    activeOverviewIds,
    newestTimestampedTerminalSpecId,
    latestTimestampedDoneSpecId,
  } = collectOverviewState(
    overviewText,
    actualSpecIds,
    specStates,
    errors
  );

  validateActiveSpecs(
    activeProgressSpecIds,
    activeOverviewIds,
    actualSpecIds,
    overviewSpecs,
    specStates,
    errors
  );
  validateRecentlyClosedSpecSet(
    recentlyClosedSpecIds,
    activeProgressSpecIds,
    actualSpecIds,
    overviewSpecs,
    specStates,
    errors
  );
  validateLastCompletedSpec(
    lastCompletedSpecId,
    activeProgressSpecIds,
    actualSpecIds,
    overviewSpecs,
    specStates,
    errors
  );
  validateRecentlyClosedRelationships(
    recentlyClosedSpecIds,
    lastCompletedSpecId,
    overviewSpecs,
    specStates,
    newestTimestampedTerminalSpecId,
    latestTimestampedDoneSpecId,
    errors
  );
};

export const collectExecutionArtifactErrors = ({ repoRoot, repoRelative }) => {
  const progressPath = path.join(repoRoot, 'progress.md');
  const specDirPath = path.join(repoRoot, 'spec');
  const specOverviewPath = path.join(specDirPath, '00_overview.md');
  const specTemplatePath = path.join(specDirPath, 'SPEC_TEMPLATE.md');
  const errors = [];

  validateRequiredArtifacts([progressPath, specOverviewPath, specTemplatePath], errors, repoRelative);

  const { activeProgressSpecIds, recentlyClosedSpecIds, lastCompletedSpecId } = validateProgressArtifact(
    progressPath,
    errors
  );
  const actualSpecIds = readActualSpecIds(specDirPath);
  const specStates = validateSpecFiles(specDirPath, actualSpecIds, errors);

  validateSpecOverview(
    specOverviewPath,
    actualSpecIds,
    activeProgressSpecIds,
    recentlyClosedSpecIds,
    lastCompletedSpecId,
    specStates,
    errors
  );

  return errors;
};
