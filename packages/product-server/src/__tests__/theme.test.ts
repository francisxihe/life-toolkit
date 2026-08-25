import { applyInspectorTheme } from '../inspector/theme';

function installDocument(): void {
  const root = {
    classList: {
      tokens: new Set<string>(),
      add(token: string) {
        this.tokens.add(token);
      },
      remove(token: string) {
        this.tokens.delete(token);
      },
      contains(token: string) {
        return this.tokens.has(token);
      },
    },
    style: { colorScheme: '' },
  };
  const body = {
    theme: null as string | null,
    setAttribute(_name: string, value: string) {
      this.theme = value;
    },
    removeAttribute() {
      this.theme = null;
    },
    getAttribute() {
      return this.theme;
    },
  };
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      documentElement: root,
      body,
    },
  });
}

describe('applyInspectorTheme', () => {
  beforeEach(() => {
    installDocument();
  });

  it('marks the document as dark', () => {
    applyInspectorTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('clears dark markers for light', () => {
    applyInspectorTheme('dark');
    applyInspectorTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.body.getAttribute('data-theme')).toBeNull();
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});
