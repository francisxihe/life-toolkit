type FocusOpener = (related?: unknown) => void;
type WorkbenchOpener = (open?: boolean) => void;

let focusOpener: FocusOpener | null = null;
let workbenchOpener: WorkbenchOpener | null = null;

export function registerFocusOpener(opener: FocusOpener | null) {
  focusOpener = opener;
}

export function requestOpenFocus(related?: unknown) {
  focusOpener?.(related);
}

export function registerWorkbenchOpener(opener: WorkbenchOpener | null) {
  workbenchOpener = opener;
}

export function requestOpenWorkbench(open = true) {
  workbenchOpener?.(open);
}
