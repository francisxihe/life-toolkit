export async function createMain() {
  const { createGrowthMain } = await import('./contribution');
  return createGrowthMain();
}
