export function storageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !('localStorage' in window)) return false;
    const testKey = '__test_storage__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

export function getThemeFromStorage(): 'dark' | 'light' | null {
  if (!storageAvailable()) return null;
  try {
    const v = window.localStorage.getItem('theme');
    if (v === 'dark') return 'dark';
    if (v === 'light') return 'light';
    return null;
  } catch (e) {
    return null;
  }
}

export function setThemeToStorage(value: 'dark' | 'light'): boolean {
  if (!storageAvailable()) return false;
  try {
    window.localStorage.setItem('theme', value);
    return true;
  } catch (e) {
    return false;
  }
}
