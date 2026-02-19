/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { ComponentProps } from 'react';

import { ChildPhotoDropZone } from '@/components/create-wizard/ChildPhotoDropZone';

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill: _fill, priority: _priority, ...imgProps } = props;
    return <img {...imgProps} alt={String(props.alt ?? '')} />;
  },
}));

afterEach(() => cleanup());

function getDropZone(container: HTMLElement): HTMLLabelElement {
  const dropZone = container.querySelector('label[for="photo"]');
  if (!(dropZone instanceof HTMLLabelElement)) {
    throw new Error('Expected drop zone label to exist');
  }
  return dropZone;
}

function renderDropZone(overrides: Partial<ComponentProps<typeof ChildPhotoDropZone>> = {}) {
  return render(
    <ChildPhotoDropZone
      existingPhotoUrl={null}
      previewObjectUrl={null}
      hasPreview={false}
      displayExistingPhoto={false}
      errorMessage={null}
      handleDrop={vi.fn()}
      openFilePicker={vi.fn()}
      {...overrides}
    />
  );
}

describe('ChildPhotoDropZone', () => {
  it('shows existing photo preview when displayExistingPhoto is true', () => {
    renderDropZone({
      existingPhotoUrl: 'https://example.com/photo.jpg',
      hasPreview: true,
      displayExistingPhoto: true,
    });

    const img = screen.getByAltText('Current child photo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('shows selected preview image when previewObjectUrl is provided', () => {
    renderDropZone({
      previewObjectUrl: 'blob:mock-url',
      hasPreview: true,
      displayExistingPhoto: false,
    });

    const previewImage = screen.getByAltText('Selected child photo preview');
    expect(previewImage).toBeInTheDocument();
    expect(previewImage).toHaveAttribute('src', 'blob:mock-url');
  });

  it('shows upload prompt when no preview is present', () => {
    renderDropZone();
    expect(screen.getByText(/drag a photo here/i)).toBeInTheDocument();
  });

  it('renders inline error when errorMessage is provided', () => {
    renderDropZone({ errorMessage: 'Photo must be under 5MB' });
    expect(screen.getByText('Photo must be under 5MB')).toBeInTheDocument();
  });

  it('applies drag-over styling on dragenter and removes on dragleave', () => {
    const { container } = renderDropZone();
    const dropZone = getDropZone(container);

    fireEvent.dragEnter(dropZone, { dataTransfer: { types: ['Files'], files: [] } });
    expect(dropZone.className).toContain('bg-sage-light');

    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).not.toContain('bg-sage-light');
  });

  it('does not forward drop events without files', () => {
    const handleDrop = vi.fn();
    const { container } = renderDropZone({ handleDrop });
    const dropZone = getDropZone(container);

    fireEvent.drop(dropZone, { dataTransfer: { types: ['text/plain'], files: [] } });
    expect(handleDrop).not.toHaveBeenCalled();
  });

  it('forwards drop events with files', () => {
    const handleDrop = vi.fn();
    const { container } = renderDropZone({ handleDrop });
    const dropZone = getDropZone(container);

    fireEvent.drop(dropZone, { dataTransfer: { types: ['Files'], files: [new File(['x'], 'a.png')] } });
    expect(handleDrop).toHaveBeenCalledTimes(1);
  });

  it('opens picker on Enter and Space keyboard interactions', () => {
    const openFilePicker = vi.fn();
    const { container } = renderDropZone({ openFilePicker });
    const dropZone = getDropZone(container);

    fireEvent.keyDown(dropZone, { key: 'Enter' });
    fireEvent.keyDown(dropZone, { key: ' ' });

    expect(openFilePicker).toHaveBeenCalledTimes(2);
  });

  it('is keyboard-focusable and includes focus-visible ring styles', () => {
    const { container } = renderDropZone();
    const dropZone = getDropZone(container);

    expect(dropZone).toHaveAttribute('tabIndex', '0');
    expect(dropZone.className).toContain('focus-visible:ring-2');
    expect(dropZone.className).toContain('focus-visible:ring-primary');
  });

  it('uses desktop top padding class that aligns heading baseline with the form card', () => {
    const { container } = renderDropZone();
    const heading = screen.getByRole('heading', { name: "Who's the birthday star?" });
    const headingContainer = heading.closest('div');

    expect(headingContainer).not.toBeNull();
    expect(headingContainer).toHaveClass('min-[801px]:pt-9');
    expect(container).toContainElement(headingContainer);
  });
});
