export function getJwtExpMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, skewMs = 5000): boolean {
  const expMs = getJwtExpMs(token);
  if (!expMs) return false;
  return Date.now() >= expMs - skewMs;
}