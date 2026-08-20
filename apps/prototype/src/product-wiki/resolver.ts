function markerPattern(reference: string) {
  return new RegExp(`<!--\\s*product-ref:\\s*${reference.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*-->`, 'g');
}

export function extractProductReference(markdown: string, reference: string) {
  const marker = markerPattern(reference).exec(markdown);
  if (!marker || marker.index === undefined) return undefined;

  const contentStart = marker.index + marker[0].length;
  const allMarkers = /<!--\s*product-ref:\s*[a-z][a-z0-9.-]*\s*-->/g;
  let nextMarker: RegExpExecArray | null;

  allMarkers.lastIndex = contentStart;
  const followingMarker = allMarkers.exec(markdown);
  const contentEnd = followingMarker?.index ?? markdown.length;
  return markdown.slice(contentStart, contentEnd).trim();
}
