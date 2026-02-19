/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
  requireHostAuth: vi.fn(),
  getDreamBoardDraft: vi.fn(),
  buildCreateFlowViewModel: vi.fn(),
  saveChildDetailsAction: vi.fn(),
}));

vi.mock('@/lib/auth/clerk-wrappers', () => ({
  requireHostAuth: mocks.requireHostAuth,
}));

vi.mock('@/lib/dream-boards/draft', () => ({
  getDreamBoardDraft: mocks.getDreamBoardDraft,
}));

vi.mock('@/lib/host/create-view-model', () => ({
  buildCreateFlowViewModel: mocks.buildCreateFlowViewModel,
}));

vi.mock('@/app/(host)/create/child/actions', () => ({
  saveChildDetailsAction: mocks.saveChildDetailsAction,
}));

vi.mock('@/components/create-wizard', () => ({
  WizardStepper: (props: Record<string, unknown>) => (
    <div data-testid="wizard-stepper" data-step={props.currentStep} />
  ),
  WizardSkeletonLoader: () => <div data-testid="skeleton" />,
  resolveWizardError: (code: string | undefined) => (code ? `Error: ${code}` : null),
}));

vi.mock('@/app/(host)/create/child/ChildStepForm', () => ({
  ChildStepForm: (props: Record<string, unknown>) => (
    <div
      data-testid="child-step-form"
      data-has-action={String(typeof props.action === 'function')}
      data-existing={(props.existingPhotoUrl as string | null) ?? ''}
      data-child-name={(props.defaultChildName as string) ?? ''}
      data-child-age={(props.defaultChildAge as string) ?? ''}
      data-error={(props.error as string | null) ?? ''}
    />
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
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(sp) }));
}

describe('Create Child Page', () => {
  it('renders stepper at step 1 of 6', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="wizard-stepper"');
    expect(html).toContain('data-step="1"');
  });

  it('delegates rendering to ChildStepForm', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="child-step-form"');
  });

  it('passes existing photo URL to ChildStepForm when draft exists', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childPhotoUrl: 'https://example.com/photo.jpg',
      childName: 'Mia',
      childAge: 4,
    });

    const html = await renderPage();
    expect(html).toContain('data-existing="https://example.com/photo.jpg"');
  });

  it('passes empty existing photo URL when draft is missing', async () => {
    const html = await renderPage();
    expect(html).toContain('data-existing=""');
  });

  it('passes resolved error message to ChildStepForm', async () => {
    const html = await renderPage({ error: 'photo' });
    expect(html).toContain('data-error="Error: photo"');
  });

  it('passes empty error when search params have no error', async () => {
    const html = await renderPage();
    expect(html).toContain('data-error=""');
  });

  it('prefills default child values from draft and passes action', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Mia',
      childAge: 4,
    });

    const html = await renderPage();
    expect(html).toContain('data-has-action="true"');
    expect(html).toContain('data-child-name="Mia"');
    expect(html).toContain('data-child-age="4"');
  });
});
