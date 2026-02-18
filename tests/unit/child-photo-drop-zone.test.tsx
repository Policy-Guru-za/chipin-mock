/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ChildPhotoDropZone } from '@/components/create-wizard/ChildPhotoDropZone';

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill: _fill, priority: _priority, ...imgProps } = props;
    return <img {...imgProps} alt={String(props.alt ?? '')} />;
  },
}));

const createObjectURLMock = vi.fn(() => 'blob:mock-url');
const revokeObjectURLMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('URL', {
    ...globalThis.URL,
    createObjectURL: createObjectURLMock,
    revokeObjectURL: revokeObjectURLMock,
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function getPhotoInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[name="photo"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Expected photo input to exist');
  }
  return input;
}

function getDropZone(container: HTMLElement): HTMLLabelElement {
  const dropZone = container.querySelector('label[for="photo"]');
  if (!(dropZone instanceof HTMLLabelElement)) {
    throw new Error('Expected drop zone label to exist');
  }
  return dropZone;
}

describe('ChildPhotoDropZone', () => {
  it('renders file input with correct accept types', () => {
    const { container } = render(<ChildPhotoDropZone existingPhotoUrl={null} />);
    const input = getPhotoInput(container);

    expect(input).toHaveAttribute('accept');
    expect(input.getAttribute('accept')).toContain('image/png');
    expect(input.getAttribute('accept')).toContain('image/jpeg');
    expect(input.getAttribute('accept')).toContain('image/webp');
  });

  it('file input is required when no existing photo', () => {
    const { container } = render(<ChildPhotoDropZone existingPhotoUrl={null} />);
    const input = getPhotoInput(container);
    expect(input).toBeRequired();
  });

  it('file input is NOT required when existing photo provided', () => {
    const { container } = render(
      <ChildPhotoDropZone existingPhotoUrl="https://example.com/photo.jpg" />
    );
    const input = getPhotoInput(container);
    expect(input).not.toBeRequired();
  });

  it('shows existing photo preview when existingPhotoUrl provided', () => {
    render(<ChildPhotoDropZone existingPhotoUrl="https://example.com/photo.jpg" />);
    const img = screen.getByAltText('Current child photo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('shows upload prompt when no existing photo', () => {
    render(<ChildPhotoDropZone existingPhotoUrl={null} />);
    expect(screen.getByText(/drag a photo here/i)).toBeInTheDocument();
  });

  it('shows preview after valid file selection', () => {
    const { container } = render(<ChildPhotoDropZone existingPhotoUrl={null} />);
    const input = getPhotoInput(container);
    const file = new File(['x'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(createObjectURLMock).toHaveBeenCalledWith(file);
    const previewImage = screen.getByAltText('Selected child photo preview');
    expect(previewImage).toBeInTheDocument();
    expect(previewImage).toHaveAttribute('src', 'blob:mock-url');
  });

  it('rejects file over 5MB', () => {
    const { container } = render(<ChildPhotoDropZone existingPhotoUrl={null} />);
    const input = getPhotoInput(container);
    const oversizedFile = new File([new Uint8Array(6 * 1024 * 1024)], 'big.png', {
      type: 'image/png',
    });

    fireEvent.change(input, { target: { files: [oversizedFile] } });

    expect(screen.getByText(/under 5mb/i)).toBeInTheDocument();
    expect(screen.queryByAltText('Selected child photo preview')).not.toBeInTheDocument();
  });

  it('rejects invalid file type', () => {
    const { container } = render(<ChildPhotoDropZone existingPhotoUrl={null} />);
    const input = getPhotoInput(container);
    const invalidFile = new File(['x'], 'doc.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(screen.getByText(/jpg, png, or webp/i)).toBeInTheDocument();
    expect(screen.queryByAltText('Selected child photo preview')).not.toBeInTheDocument();
  });

  it('applies drag-over styling on dragenter and removes on dragleave', () => {
    const { container } = render(<ChildPhotoDropZone existingPhotoUrl={null} />);
    const dropZone = getDropZone(container);

    fireEvent.dragEnter(dropZone, { dataTransfer: { types: ['Files'], files: [] } });
    expect(dropZone.className).toContain('bg-sage-light');

    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).not.toContain('bg-sage-light');
  });

  it('cleans up object URL on unmount', () => {
    const { container, unmount } = render(<ChildPhotoDropZone existingPhotoUrl={null} />);
    const input = getPhotoInput(container);
    const file = new File(['x'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });
    unmount();

    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
  });
});
