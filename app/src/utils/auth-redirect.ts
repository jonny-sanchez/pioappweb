export function redirectToLogin(reason: 'expired' | 'invalid' | 'required' = 'expired') {
  const current =
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : '/';
  const url = `/login`;
  if (typeof window !== 'undefined') {
    window.location.replace(url);
  }
}