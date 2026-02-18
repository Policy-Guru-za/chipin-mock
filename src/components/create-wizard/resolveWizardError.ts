export function resolveWizardError(
  error: string | undefined,
  messages: Record<string, string>,
  aliases?: Record<string, string>,
): string | null {
  if (!error) {
    return null;
  }

  if (aliases?.[error]) {
    return aliases[error];
  }

  return messages[error] ?? null;
}

