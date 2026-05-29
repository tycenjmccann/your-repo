export function readLocalStorage(key: string, fallback: string): string {
  try {
    if (typeof window === 'undefined') return fallback;
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable, silently fail
  }
}
