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
  extractIconIdFromPath: vi.fn(),
  isValidGiftIconId: vi.fn(),
  suggestGiftIcon: vi.fn(),
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

vi.mock('@/lib/icons/gift-icons', () => ({
  extractIconIdFromPath: mocks.extractIconIdFromPath,
  isValidGiftIconId: mocks.isValidGiftIconId,
}));

vi.mock('@/lib/icons/suggest-icon', () => ({
  suggestGiftIcon: mocks.suggestGiftIcon,
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
  WizardPreviewPanel: (props: Record<string, unknown>) => (
    <section data-testid="preview-panel">{props.children as ReactNode}</section>
  ),
  WizardFormCard: (props: Record<string, unknown>) => <div>{props.children as ReactNode}</div>,
  WizardEyebrow: (props: Record<string, unknown>) => <span>{props.children as ReactNode}</span>,
  WizardPanelTitle: (props: Record<string, unknown>) => <h2>{props.children as ReactNode}</h2>,
  WizardFieldTip: (props: Record<string, unknown>) => <div>{props.children as ReactNode}</div>,
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

vi.mock('@/components/gift/GiftIconPicker', () => ({
  GiftIconPicker: () => <div data-testid="gift-icon-picker" />,
}));

vi.mock('@/components/create-wizard/GiftIconPreview', () => ({
  GiftIconPreview: (props: Record<string, unknown>) => (
    <div
      data-testid="gift-icon-preview"
      data-selected-icon={(props.selectedIcon as string | null) ?? ''}
    />
  ),
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
    giftDescription: '',
    giftIconId: 'scooter',
    giftImageUrl: null,
    message: '',
  });
  mocks.buildCreateFlowViewModel.mockReturnValue({ redirectTo: null });
  mocks.extractIconIdFromPath.mockReturnValue(null);
  mocks.isValidGiftIconId.mockImplementation((id: string) => id === 'scooter' || id === 'rocket');
  mocks.suggestGiftIcon.mockReturnValue({ id: 'scooter' });
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

  it('renders split layout with preview panel and form card', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="split-layout"');
    expect(html).toContain('data-testid="gift-icon-preview"');
    expect(html).toContain('data-testid="field-giftName"');
    expect(html).toContain('data-testid="field-giftDescription"');
  });

  it('prefills gift name from draft', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Maya',
      childAge: 7,
      giftName: 'LEGO Millennium Falcon',
      giftDescription: '',
      giftIconId: 'scooter',
      giftImageUrl: null,
      message: '',
    });

    const html = await renderPage();
    expect(html).toContain('data-testid="giftName"');
    expect(html).toContain('value="LEGO Millennium Falcon"');
  });

  it('prefills gift description from draft', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Maya',
      childAge: 7,
      giftName: '',
      giftDescription: 'Collector edition with display stand',
      giftIconId: 'scooter',
      giftImageUrl: null,
      message: '',
    });

    const html = await renderPage();
    expect(html).toContain('data-testid="giftDescription"');
    expect(html).toContain('data-default-value="Collector edition with display stand"');
  });

  it('passes selected icon to GiftIconPreview from draft', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Maya',
      childAge: 7,
      giftName: '',
      giftDescription: '',
      giftIconId: 'rocket',
      giftImageUrl: null,
      message: '',
    });

    const html = await renderPage();
    expect(html).toContain('data-testid="gift-icon-preview"');
    expect(html).toContain('data-selected-icon="rocket"');
  });

  it('shows error message via WizardCTA when error searchParam is present', async () => {
    const html = await renderPage({ error: 'invalid' });
    expect(html).toContain('data-testid="wizard-cta"');
    expect(html).toContain('data-error="Error: invalid"');
  });

  it('does NOT pass error to individual field wrappers', async () => {
    const html = await renderPage({ error: 'invalid' });
    for (const fieldId of ['giftName', 'giftDescription', 'giftIconId', 'message']) {
      expect(html).toMatch(new RegExp(`data-testid="field-${fieldId}"[^>]*data-error=""`));
    }
  });
});
