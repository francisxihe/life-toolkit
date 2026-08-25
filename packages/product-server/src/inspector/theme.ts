export type InspectorTheme = 'light' | 'dark';

export function applyInspectorTheme(theme: InspectorTheme): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
    return;
  }
  document.body.removeAttribute('data-theme');
  root.classList.remove('dark');
  root.style.colorScheme = 'light';
}
