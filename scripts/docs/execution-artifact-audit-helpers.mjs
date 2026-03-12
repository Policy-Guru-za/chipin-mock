const NUMBERED_SPEC_FILE = /^\d{2}_.+\.md$/;
const NUMBERED_SPEC_ID = /^\d{2}_.+$/;
const SPEC_PATH_LABEL = /^spec\/(\d{2}_.+)\.md$/;
const SLOT_ID = /^\d{2}$/;
const FINAL_STATE_FIELDS = ['Status', 'Exit Criteria State', 'Successor Slot', 'Notes'];
const VALID_EXIT_CRITERIA_STATES = new Set(['pending', 'satisfied', 'not-satisfied']);

export const REQUIRED_PROGRESS_HEADINGS = [
  'Current Spec',
  'Current Stage',
  'Status',
  'Blockers',
  'Next Step',
  'Last Session Spec',
  'Last Completed Spec',
  'Last Green Commands',
  'Dogfood Evidence',
  'Napkin Evidence',
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
export const PLACEHOLDER_SPEC_SUFFIX = '_session-placeholder';

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

  if (!finalState.notes || finalState.notes === '<free text>') {
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

export const isNumberedSpecFile = (name) => NUMBERED_SPEC_FILE.test(name) && name !== '00_overview.md';

export const isPlaceholderSpecId = (specId) => specId.endsWith(PLACEHOLDER_SPEC_SUFFIX);
