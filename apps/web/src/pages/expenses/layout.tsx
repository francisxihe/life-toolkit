"use client"

import { ExpensesProvider } from './context/expenses-context'

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExpensesProvider>
      {children}
    </ExpensesProvider>
  )
}