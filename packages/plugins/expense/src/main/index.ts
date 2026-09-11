export async function createMain() {
  const { createExpenseMain } = await import('./contribution');
  return createExpenseMain();
}
