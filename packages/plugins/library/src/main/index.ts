export async function createMain() {
  const { createLibraryMain } = await import('./contribution');
  return createLibraryMain();
}
