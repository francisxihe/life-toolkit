export const DEFAULT_CATEGORIES: Record<
  string,
  { name: string; type: 'income' | 'expense' }
> = {
  salary: { name: '工资', type: 'income' },
  investment: { name: '投资收益', type: 'income' },
  freelance: { name: '兼职', type: 'income' },
  bonus: { name: '奖金', type: 'income' },
  rent: { name: '房租', type: 'expense' },
  utilities: { name: '水电费', type: 'expense' },
  groceries: { name: '生活用品', type: 'expense' },
  transportation: { name: '交通', type: 'expense' },
  entertainment: { name: '娱乐', type: 'expense' },
  healthcare: { name: '医疗', type: 'expense' },
  shopping: { name: '购物', type: 'expense' },
  dining: { name: '餐饮', type: 'expense' },
  education: { name: '教育', type: 'expense' },
  travel: { name: '旅行', type: 'expense' },
};

export const PERIODS = {
  all: '全部',
  daily: '日',
  weekly: '周',
  monthly: '月',
  yearly: '年',
} as const;

export const BUDGET_PERIODS = {
  monthly: '月',
  yearly: '年',
} as const;
