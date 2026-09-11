export async function createMain() {
  const { createPurchaseMain } = await import('./contribution');
  return createPurchaseMain();
}
