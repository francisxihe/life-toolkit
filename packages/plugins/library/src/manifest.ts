import { PLUGIN_API_VERSION, type PluginManifest } from '@true-north/plugin-sdk';
import { version } from '../package.json';
import { LIBRARY_EXTRACT_ACTION } from './contract/index';

export const libraryManifest: PluginManifest = {
  pluginId: 'library',
  apiVersion: PLUGIN_API_VERSION,
  version,
  contributions: {
    ipc: [{ id: 'library', routePrefix: '/library' }],
    workbench: { actionIds: [LIBRARY_EXTRACT_ACTION] },
    activity: { captureTypes: ['library.bookmark'], entityTypes: ['bookmark'], today: true },
    storage: {
      entityTypes: ['bookmark'],
    },
  },
};

export default libraryManifest;
