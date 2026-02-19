/**
 * @vitest-environment jsdom
 */
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireHostAuth: vi.fn(),
  getDreamBoardDraft: vi.fn(),
  saveManualGiftAction: vi.fn(),
  buildCreateFlowViewModel: vi.fn(),
}));

vi.mock('@/lib/auth/clerk-wrappers', () => ({
  requireHostAuth: mocks.requireHostAuth,
}));

vi.mock('@/lib/dream-boards/draft', () => ({
  getDreamBoardDraft: mocks.getDreamBoardDraft,
}));

vi.mock('@/app/(host)/create/gift/actions', () => ({
  saveManualGiftAction: mocks.saveManualGiftAction,
}));

vi.mock('@/lib/host/create-view-model', () => ({
  buildCreateFlowViewModel: mocks.buildCreateFlowViewModel,
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/components/create-wizard', () => ({
  WizardStepper: (props: Record<string, unknown>) => (
    <div data-testid="wizard-stepper" data-step={props.currentStep} />
  ),
  WizardCenteredLayout: (props: Record<string, unknown>) => (
    <div data-testid="centered-layout">{props.children as ReactNode}</div>
  ),
  WizardPanelTitle: (props: Record<string, unknown>) => (
    <h2 data-testid="panel-title" data-variant={String(props.variant ?? '')}>
      {props.children as ReactNode}
    </h2>
  ),
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
  WizardTextarea: (props: Record<string, unknown>) => (
    <textarea
      data-testid={String(props.id)}
      data-default-value={String((props.defaultValue as string | undefined) ?? '')}
    />
  ),
  WizardCTA: (props: Record<string, unknown>) => (
    <div data-testid="wizard-cta" data-error={(props.error as string | null) ?? ''} />
  ),
  WizardSkeletonLoader: () => <div data-testid="skeleton" />,
  resolveWizardError: (code: string | undefined) => (code ? `Error: ${code}` : null),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();

  mocks.requireHostAuth.mockResolvedValue({ hostId: 'host-1' });
  mocks.getDreamBoardDraft.mockResolvedValue({
    childName: 'Maya',
    childAge: 7,
    giftName: '',
    message: '',
  });
  mocks.buildCreateFlowViewModel.mockReturnValue({ redirectTo: null });
});

async function renderPage(sp: Record<string, string> = {}) {
  const Page = (await import('@/app/(host)/create/gift/page')).default;
  const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve(sp) }));
  return html;
}

describe('Create Gift Page', () => {
  it('renders stepper at step 2 of 6', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="wizard-stepper"');
    expect(html).toContain('data-step="2"');
  });

  it('renders centered layout with gift name and message fields', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="centered-layout"');
    expect(html).toContain('data-testid="panel-title"');
    expect(html).toContain('data-variant="form"');
    expect(html).toContain('class="mb-7 text-[13px] font-light leading-relaxed text-ink-soft"');
    expect(html).toContain('data-testid="field-giftName"');
    expect(html).toContain('data-testid="field-message"');
    expect(html).not.toContain('data-testid="split-layout"');
    expect(html).not.toContain('data-testid="gift-icon-preview"');
    expect(html).not.toContain('data-testid="field-giftDescription"');
    expect(html).not.toContain('data-testid="field-giftIconId"');
    expect(html).not.toContain('/icons/gifts/gifta-logo.png');
  });

  it('prefills gift name from draft', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Maya',
      childAge: 7,
      giftName: 'LEGO Millennium Falcon',
      message: '',
    });

    const html = await renderPage();
    expect(html).toContain('data-testid="giftName"');
    expect(html).toContain('value="LEGO Millennium Falcon"');
  });

  it('prefills message from draft', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Maya',
      childAge: 7,
      giftName: '',
      message: 'Thanks everyone!',
    });

    const html = await renderPage();
    expect(html).toContain('data-testid="message"');
    expect(html).toContain('data-default-value="Thanks everyone!"');
    expect(html).toContain('What&#x27;s the one gift Maya is dreaming of?');
  });

  it('shows error message via WizardCTA when error searchParam is present', async () => {
    const html = await renderPage({ error: 'invalid' });
    expect(html).toContain('data-testid="wizard-cta"');
    expect(html).toContain('data-error="Error: invalid"');
  });

  it('does NOT pass error to individual field wrappers', async () => {
    const html = await renderPage({ error: 'invalid' });
    for (const fieldId of ['giftName', 'message']) {
      expect(html).toMatch(new RegExp(`data-testid="field-${fieldId}"[^>]*data-error=""`));
    }
  });

  it('does not render decorative logo markup', async () => {
    const html = await renderPage();
    expect(html).not.toContain('/icons/gifts/gifta-logo.png');
  });
});
