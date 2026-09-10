const DEFAULT_RETURN_PATH = '/ai';
const STORAGE_KEY = 'setting-return-path';

function isSettingPath(pathname: string) {
  return pathname === '/setting' || pathname.startsWith('/setting/');
}

export function rememberReturnPath(pathname: string) {
  if (!pathname || isSettingPath(pathname) || pathname === '/login') {
    return;
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, pathname);
  } catch {
    // sessionStorage may be unavailable
  }
}

export function getReturnPath() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || DEFAULT_RETURN_PATH;
  } catch {
    return DEFAULT_RETURN_PATH;
  }
}
