export const DEFAULT_CATEGORIES: Record<string, { name: string, type: 'income' | 'expense' }> = {
  salary: { name: 'Salary', type: 'income' },
  investment: { name: 'Investment Returns', type: 'income' },
  freelance: { name: 'Freelance', type: 'income' },
  bonus: { name: 'Bonus', type: 'income' },
  rent: { name: 'Rent', type: 'expense' },
  utilities: { name: 'Utilities', type: 'expense' },
  groceries: { name: 'Groceries', type: 'expense' },
  transportation: { name: 'Transportation', type: 'expense' },
  entertainment: { name: 'Entertainment', type: 'expense' },
  healthcare: { name: 'Healthcare', type: 'expense' },
  shopping: { name: 'Shopping', type: 'expense' },
  dining: { name: 'Dining', type: 'expense' },
  education: { name: 'Education', type: 'expense' },
  travel: { name: 'Travel', type: 'expense' },
}

export const PERIODS = {
  all: 'All Time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
} as const

export const BUDGET_PERIODS = {
  monthly: 'Monthly',
  yearly: 'Yearly',
} as const