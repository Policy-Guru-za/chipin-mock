/**
 * @vitest-environment jsdom
 */
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
  requireHostAuth: vi.fn(),
  getDreamBoardDraft: vi.fn(),
  saveDreamBoardDraft: vi.fn(),
  uploadChildPhoto: vi.fn(),
  deleteChildPhoto: vi.fn(),
  log: vi.fn(),
  captureException: vi.fn(),
  buildCreateFlowViewModel: vi.fn(),
}));

vi.mock('@/lib/auth/clerk-wrappers', () => ({
  requireHostAuth: mocks.requireHostAuth,
}));

vi.mock('@/lib/dream-boards/draft', () => ({
  getDreamBoardDraft: mocks.getDreamBoardDraft,
  saveDreamBoardDraft: mocks.saveDreamBoardDraft,
}));

vi.mock('@/lib/integrations/blob', () => ({
  uploadChildPhoto: mocks.uploadChildPhoto,
  deleteChildPhoto: mocks.deleteChildPhoto,
  UploadChildPhotoError: class extends Error {
    code: string;

    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
}));

vi.mock('@/lib/observability/logger', () => ({
  log: mocks.log,
}));

vi.mock('@/lib/config/feature-flags', () => ({
  isMockSentry: () => true,
}));

vi.mock('@/lib/host/create-view-model', () => ({
  buildCreateFlowViewModel: mocks.buildCreateFlowViewModel,
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: mocks.captureException,
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/components/create-wizard', () => ({
  WizardStepper: (props: Record<string, unknown>) => (
    <div data-testid="wizard-stepper" data-step={props.currentStep} />
  ),
  WizardSplitLayout: (props: Record<string, unknown>) => (
    <div data-testid="split-layout">
      {props.left as ReactNode}
      {props.right as ReactNode}
    </div>
  ),
  WizardFormCard: (props: Record<string, unknown>) => <div>{props.children as ReactNode}</div>,
  WizardEyebrow: (props: Record<string, unknown>) => <span>{props.children as ReactNode}</span>,
  WizardPanelTitle: (props: Record<string, unknown>) => <h2>{props.children as ReactNode}</h2>,
  WizardFieldWrapper: (props: Record<string, unknown>) => (
    <div data-testid={`field-${props.htmlFor}`} data-error={(props.error as string | null) ?? ''}>
      {props.children as ReactNode}
    </div>
  ),
  WizardTextInput: (props: Record<string, unknown>) => (
    <input
      data-testid={String(props.id)}
      defaultValue={props.defaultValue as string | number | readonly string[] | undefined}
    />
  ),
  WizardCTA: (props: Record<string, unknown>) => (
    <div data-testid="wizard-cta" data-error={(props.error as string | null) ?? ''} />
  ),
  WizardFieldTip: (props: Record<string, unknown>) => <div>{props.children as ReactNode}</div>,
  WizardSkeletonLoader: () => <div data-testid="skeleton" />,
  resolveWizardError: (code: string | undefined) => (code ? `Error: ${code}` : null),
}));

vi.mock('@/components/create-wizard/ChildPhotoDropZone', () => ({
  ChildPhotoDropZone: (props: Record<string, unknown>) => (
    <div data-testid="photo-drop-zone" data-existing={(props.existingPhotoUrl as string | null) ?? ''} />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireHostAuth.mockResolvedValue({ hostId: 'host-1' });
  mocks.getDreamBoardDraft.mockResolvedValue(null);
  mocks.buildCreateFlowViewModel.mockReturnValue({
    stepLabel: 'The child',
    title: 'Child details',
    subtitle: 'Tell us a little about the birthday child.',
  });
});

async function renderPage(sp: Record<string, string> = {}) {
  const Page = (await import('@/app/(host)/create/child/page')).default;
  const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve(sp) }));
  return html;
}

describe('Create Child Page', () => {
  it('renders stepper at step 1 of 6', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="wizard-stepper"');
    expect(html).toContain('data-step="1"');
  });

  it('renders split layout with photo drop zone and form card', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="split-layout"');
    expect(html).toContain('data-testid="photo-drop-zone"');
    expect(html).toContain('data-testid="field-childName"');
  });

  it('passes existing photo URL to ChildPhotoDropZone when draft exists', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childPhotoUrl: 'https://example.com/photo.jpg',
      childName: 'Mia',
      childAge: 4,
    });

    const html = await renderPage();
    expect(html).toContain('data-existing="https://example.com/photo.jpg"');
  });

  it('passes empty string for existing photo when no draft', async () => {
    const html = await renderPage();
    expect(html).toContain('data-existing=""');
  });

  it('shows error message from searchParams via WizardCTA', async () => {
    const html = await renderPage({ error: 'photo' });
    expect(html).toContain('data-testid="wizard-cta"');
    expect(html).toContain('data-error="Error: photo"');
  });

  it('does NOT pass error to childName field wrapper', async () => {
    const html = await renderPage({ error: 'photo' });
    expect(html).toContain('data-testid="field-childName"');
    expect(html).toContain('data-error=""');
  });

  it('prefills childName input default value from draft', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Mia',
      childAge: 4,
    });

    const html = await renderPage();
    expect(html).toContain('data-testid="childName"');
    expect(html).toContain('value="Mia"');
  });
});
