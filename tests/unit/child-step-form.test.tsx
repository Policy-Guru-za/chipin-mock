/**
 * @vitest-environment jsdom
 */
import { cleanup, render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChildStepForm } from '@/app/(host)/create/child/ChildStepForm';

const mocks = vi.hoisted(() => ({
  useChildPhoto: vi.fn(),
}));

vi.mock('@/components/create-wizard/useChildPhoto', () => ({
  useChildPhoto: mocks.useChildPhoto,
}));

vi.mock('@/components/create-wizard/ChildPhotoDropZone', () => ({
  ChildPhotoDropZone: () => <div data-testid="photo-drop-zone" />,
}));

vi.mock('@/components/create-wizard/ChildPhotoCompactRow', () => ({
  ChildPhotoCompactRow: () => <div data-testid="photo-compact-row" />,
}));

vi.mock('@/components/create-wizard', () => ({
  WizardSplitLayout: (props: Record<string, unknown>) => (
    <div>
      {props.left as ReactNode}
      {props.right as ReactNode}
    </div>
  ),
  WizardFormCard: (props: Record<string, unknown>) => <div>{props.children as ReactNode}</div>,
  WizardEyebrow: (props: Record<string, unknown>) => <span>{props.children as ReactNode}</span>,
  WizardPanelTitle: (props: Record<string, unknown>) => <h2>{props.children as ReactNode}</h2>,
  WizardFieldWrapper: (props: Record<string, unknown>) => <div>{props.children as ReactNode}</div>,
  WizardFieldTip: (props: Record<string, unknown>) => <div>{props.children as ReactNode}</div>,
  WizardTextInput: (props: Record<string, unknown>) => <input {...props} />,
  WizardCTA: () => <div data-testid="wizard-cta" />,
}));

function mockPhotoState(hasPreview: boolean) {
  mocks.useChildPhoto.mockReturnValue({
    inputRef: { current: null },
    previewObjectUrl: null,
    errorMessage: null,
    hasPreview,
    displayExistingPhoto: false,
    handleInputChange: vi.fn(),
    handleDrop: vi.fn(),
    openFilePicker: vi.fn(),
  });
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  mockPhotoState(false);
});

describe('ChildStepForm', () => {
  it('requires photo upload when there is no existing or selected photo', () => {
    const { container } = render(
      <ChildStepForm
        action={vi.fn()}
        existingPhotoUrl={null}
        defaultChildName=""
        defaultChildAge=""
        error={null}
      />,
    );

    const photoInput = container.querySelector('input[name="photo"]');
    expect(photoInput).toBeRequired();
  });

  it('does not require photo upload when a preview already exists', () => {
    mockPhotoState(true);
    const { container } = render(
      <ChildStepForm
        action={vi.fn()}
        existingPhotoUrl="https://example.com/child.jpg"
        defaultChildName="Mia"
        defaultChildAge="7"
        error={null}
      />,
    );

    const photoInput = container.querySelector('input[name="photo"]');
    expect(photoInput).not.toBeRequired();
  });
});
