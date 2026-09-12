import type { DesktopPluginHost } from './host';

let activeHost: DesktopPluginHost | null = null;

export function setActiveHost(host: DesktopPluginHost | null) {
  activeHost = host;
}

export function getPluginHost(): DesktopPluginHost {
  if (!activeHost) throw new Error('Plugin host is not booted');
  return activeHost;
}

export function getPluginHostOptional(): DesktopPluginHost | null {
  return activeHost;
}
