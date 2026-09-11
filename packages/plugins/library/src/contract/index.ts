import { pluginPath } from '@true-north/plugin-sdk';

export const LIBRARY_PLUGIN_ID = 'library';
export const LIBRARY_EXTRACT_ACTION = 'library.extract';

export const libraryPaths = {
  root: pluginPath(LIBRARY_PLUGIN_ID),
} as const;
