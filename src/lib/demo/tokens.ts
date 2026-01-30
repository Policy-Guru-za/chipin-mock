export const buildDemoToken = (value: string) => {
  const token = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  return token.length > 0 ? token : '000000';
};
