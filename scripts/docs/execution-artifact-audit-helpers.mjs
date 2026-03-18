const NUMBERED_SPEC_FILE = /^\d{2}_.+\.md$/;
const NUMBERED_SPEC_ID = /^\d{2}_.+$/;
const SPEC_PATH_LABEL = /^spec\/(\d{2}_.+)\.md$/;
const SLOT_ID = /^\d{2}$/;
const FINAL_STATE_FIELDS = ['Status', 'Exit Criteria State', 'Successor Slot', 'Notes'];
const VALID_EXIT_CRITERIA_STATES = new Set(['pending', 'satisfied', 'not-satisfied']);

export const REQUIRED_PROGRESS_HEADINGS = [
  'Active Full Specs',
  'Quick Tasks',
  'Recently Closed Specs',
  'Last Completed Spec',
  'Last Green Commands',
  'Dogfood Evidence',
  'Napkin Evidence',
];

export const REQUIRED_ACTIVE_SPEC_COLUMNS = [
  'Spec',
  'Title',
  'Owner',
  'Stage',
  'Status',
  'Blockers',
  'Next Step',
  'Last Updated',
];

export const REQUIRED_QUICK_TASK_COLUMNS = [
  'Task ID',
  'Scope',
  'Owner',
  'Verification',
  'Status',
  'Next Step',
];

export const REQUIRED_OVERVIEW_COLUMNS = [
  'Spec',
  'Title',
  'Status',
  'Closed At',
  'Owner',
  'Depends On',
  'Notes',
];

export const REQUIRED_SPEC_HEADINGS = [
  'Objective',
  'In Scope',
  'Out Of Scope',
  'Dependencies',
  'Stage Plan',
  'Test Gate',
  'Exit Criteria',
  'Final State',
];

export const VALID_SPEC_STATUSES = new Set(['Active', 'Done', 'Superseded']);
export const TERMINAL_SPEC_STATUSES = new Set(['Done', 'Superseded']);
export const CLOSED_AT_REQUIRED_FROM_SLOT = 40;

const CLOSED_AT_PLACEHOLDER_VALUES = new Set(['', '—', '-', 'None', 'none']);
const CLOSED_AT_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const hasHeading = (text, heading) => new RegExp(`^## ${escapeRegExp(heading)}$`, 'm').test(text);

export const sectionBody = (text, heading) => {
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

export const referencedSpecIds = (text) => {
  const ids = new Set();

  for (const value of backtickedValues(text)) {
    if (NUMBERED_SPEC_ID.test(value)) {
      ids.add(value);
      continue;
    }

    const specPathMatch = SPEC_PATH_LABEL.exec(value);
    if (specPathMatch) {
      ids.add(specPathMatch[1]);
    }
  }

  return [...ids];
};

export const resolveProgressSpecId = (progressText, heading, errors) => {
  const section = sectionBody(progressText, heading);
  if (section === null) {
    errors.push(`progress.md: missing \`## ${heading}\` section body.`);
    return null;
  }

  const tokens = backtickedValues(section).filter((value) => NUMBERED_SPEC_ID.test(value));
  if (tokens.length !== 1) {
    errors.push(`progress.md: \`## ${heading}\` must contain exactly one backticked numbered spec id.`);
    return null;
  }

  return tokens[0];
};

const splitTableLine = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

export const parseMarkdownTable = (section) => {
  if (!section) return { headers: [], rows: [] };

  const tableLines = section
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().startsWith('|'));

  if (tableLines.length < 2) {
    return { headers: [], rows: [] };
  }

  const headers = splitTableLine(tableLines[0]);
  const rows = [];

  for (const line of tableLines.slice(2)) {
    if (!line.trim().startsWith('|')) continue;
    const cells = splitTableLine(line);
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;

    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? '';
    });
    rows.push(row);
  }

  return { headers, rows };
};

export const isExplicitNone = (section) => {
  if (!section) return false;
  const lines = section
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length === 1 && /^[-*]\s+None\.?$/i.test(lines[0]);
};

export const specSlot = (specId) => Number.parseInt(specId.slice(0, 2), 10);

export const normalizeClosedAt = (value = '') => {
  const trimmed = value.trim();
  return CLOSED_AT_PLACEHOLDER_VALUES.has(trimmed) ? null : trimmed;
};

export const isValidClosedAt = (value) => CLOSED_AT_FORMAT.test(value) && !Number.isNaN(Date.parse(value));

export const parseRecentlyClosedEntries = (section) => {
  if (!section) {
    return { entries: [], invalidLines: [] };
  }

  const entries = [];
  const invalidLines = [];

  for (const rawLine of section.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const bulletMatch = /^[-*]\s+(.+)$/.exec(line);
    if (!bulletMatch) {
      invalidLines.push(line);
      continue;
    }

    const orderedSpecIds = [];
    for (const value of backtickedValues(bulletMatch[1])) {
      if (NUMBERED_SPEC_ID.test(value)) {
        orderedSpecIds.push(value);
        continue;
      }

      const specPathMatch = SPEC_PATH_LABEL.exec(value);
      if (specPathMatch) {
        orderedSpecIds.push(specPathMatch[1]);
      }
    }

    if (orderedSpecIds.length === 0) {
      invalidLines.push(line);
      continue;
    }

    entries.push({
      primarySpecId: orderedSpecIds[0],
      referencedSpecIds: [...new Set(orderedSpecIds)],
      line,
    });
  }

  return { entries, invalidLines };
};

const parseFinalStateFieldMap = (specId, text, errors) => {
  const body = sectionBody(text, 'Final State');
  if (body === null) {
    errors.push(`spec/${specId}.md: missing required heading -> ## Final State`);
    return null;
  }

  const fields = new Map();

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('- ')) continue;

    const match = /^- ([^:]+):\s*(.+)$/.exec(line);
    if (!match) continue;
    fields.set(match[1], match[2]);
  }

  for (const field of FINAL_STATE_FIELDS) {
    if (!fields.has(field)) {
      errors.push(`spec/${specId}.md: \`## Final State\` must include \`- ${field}: ...\`.`);
    }
  }

  if (FINAL_STATE_FIELDS.some((field) => !fields.has(field))) {
    return null;
  }

  return fields;
};

export const parseFinalState = (specId, text, errors) => {
  const fields = parseFinalStateFieldMap(specId, text, errors);
  if (!fields) return null;

  return {
    status: fields.get('Status'),
    exitCriteriaState: fields.get('Exit Criteria State'),
    successorSlot: fields.get('Successor Slot'),
    notes: fields.get('Notes'),
  };
};

const validateBaseFinalState = (specId, finalState, errors) => {
  if (!VALID_SPEC_STATUSES.has(finalState.status)) {
    errors.push(`spec/${specId}.md: invalid Final State status (${finalState.status}).`);
  }

  if (!VALID_EXIT_CRITERIA_STATES.has(finalState.exitCriteriaState)) {
    errors.push(
      `spec/${specId}.md: invalid Final State exit criteria state (${finalState.exitCriteriaState}).`
    );
  }

  if (finalState.successorSlot !== 'none' && !SLOT_ID.test(finalState.successorSlot)) {
    errors.push(
      `spec/${specId}.md: Final State successor slot must be \`none\` or a two-digit slot number.`
    );
  }

  if (!finalState.notes || finalState.notes === '<specific summary>') {
    errors.push(`spec/${specId}.md: Final State notes must be specific, not a placeholder.`);
  }
};

const validateActiveFinalState = (specId, finalState, errors) => {
  if (finalState.status !== 'Active') return;

  if (finalState.exitCriteriaState !== 'pending') {
    errors.push(`spec/${specId}.md: Active specs must use \`Exit Criteria State: pending\`.`);
  }

  if (finalState.successorSlot !== 'none') {
    errors.push(`spec/${specId}.md: Active specs must use \`Successor Slot: none\`.`);
  }
};

const validateDoneFinalState = (specId, finalState, errors) => {
  if (finalState.status !== 'Done') return;

  if (finalState.exitCriteriaState !== 'satisfied') {
    errors.push(`spec/${specId}.md: Done specs must use \`Exit Criteria State: satisfied\`.`);
  }

  if (finalState.successorSlot !== 'none') {
    errors.push(`spec/${specId}.md: Done specs must use \`Successor Slot: none\`.`);
  }
};

const validateSupersededSuccessor = (specId, finalState, actualSpecIds, errors) => {
  if (!SLOT_ID.test(finalState.successorSlot)) {
    errors.push(`spec/${specId}.md: Superseded specs must point to a real successor slot.`);
    return;
  }

  if (finalState.successorSlot === specId.slice(0, 2)) {
    errors.push(`spec/${specId}.md: Superseded specs cannot point to their own slot as the successor.`);
    return;
  }

  const matchingSuccessors = actualSpecIds.filter((candidate) =>
    candidate.startsWith(`${finalState.successorSlot}_`)
  );

  if (matchingSuccessors.length !== 1) {
    errors.push(
      `spec/${specId}.md: Superseded successor slot ${finalState.successorSlot} must resolve to exactly one numbered spec.`
    );
  }
};

const validateSupersededFinalState = (specId, finalState, actualSpecIds, errors) => {
  if (finalState.status !== 'Superseded') return;

  if (finalState.exitCriteriaState !== 'not-satisfied') {
    errors.push(
      `spec/${specId}.md: Superseded specs must use \`Exit Criteria State: not-satisfied\`.`
    );
  }

  validateSupersededSuccessor(specId, finalState, actualSpecIds, errors);
};

export const validateFinalState = (specId, finalState, actualSpecIds, errors) => {
  if (!finalState) return;

  validateBaseFinalState(specId, finalState, errors);
  validateActiveFinalState(specId, finalState, errors);
  validateDoneFinalState(specId, finalState, errors);
  validateSupersededFinalState(specId, finalState, actualSpecIds, errors);
};

export const listedSpecs = (overviewText) => {
  const { headers, rows } = parseMarkdownTable(overviewText);
  const specs = new Map();

  for (const row of rows) {
    const specIds = referencedSpecIds(row.Spec ?? '');
    if (specIds.length !== 1) continue;

    const specId = specIds[0];
    specs.set(specId, {
      status: (row.Status ?? '').trim(),
      closedAt: normalizeClosedAt(row['Closed At'] ?? ''),
    });
  }

  return { headers, specs };
};

export const isNumberedSpecFile = (name) => NUMBERED_SPEC_FILE.test(name) && name !== '00_overview.md';
