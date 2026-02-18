/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { WizardTextInput } from '@/components/create-wizard/WizardTextInput';

afterEach(() => cleanup());

describe('WizardTextInput', () => {
  it('passes through name, type, required, and defaultValue', () => {
    render(
      <WizardTextInput
        name="childEmail"
        type="email"
        required
        defaultValue="maya@example.com"
      />,
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'childEmail');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
    expect(input).toHaveValue('maya@example.com');
  });

  it('renders placeholder text', () => {
    render(<WizardTextInput placeholder="Enter name" />);
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('passes through inputMode', () => {
    render(<WizardTextInput inputMode="numeric" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
  });

  it('passes through autoCapitalize', () => {
    render(<WizardTextInput autoCapitalize="words" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('autocapitalize', 'words');
  });

  it('passes through enterKeyHint', () => {
    render(<WizardTextInput enterKeyHint="next" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('enterkeyhint', 'next');
  });

  it('passes through autoComplete', () => {
    render(<WizardTextInput autoComplete="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'email');
  });

  it('preserves controlled value and onChange passthrough', () => {
    const handleChange = vi.fn();
    render(<WizardTextInput value="test" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test');

    fireEvent.change(input, { target: { value: 'updated' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});

