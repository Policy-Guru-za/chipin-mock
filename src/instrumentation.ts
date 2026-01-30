export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { register } = await import('./instrumentation.node');
    await register();
    return;
  }

  const { register } = await import('./instrumentation.edge');
  await register();
}
