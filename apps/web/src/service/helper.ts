export function setToken(token: string) {
  if (token) {
    localStorage.setItem('token', `${token}`);
  }
}

export function getToken() {
  return localStorage.getItem('token') || '';
}

export function getEmbedAccessToken() {
  return sessionStorage.getItem('embedAccessToken') || '';
}
