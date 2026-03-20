import pb from '@/lib/pocketbase/client'

export interface FinancialDoc {
  id: string
  doc_type: string
  amount: number
  due_date: string
  status: string
  entity_name: string
  currency: string
  created: string
}

export interface BudgetEntry {
  id: string
  year: number
  cost_center: string
  category: string
  amount: number
  currency: string
  created: string
}

export const getFinancialDocs = () =>
  pb.collection('financial_docs').getFullList<FinancialDoc>({ sort: '-created' })

export const createFinancialDoc = (data: Partial<FinancialDoc>) =>
  pb.collection('financial_docs').create<FinancialDoc>(data)

export const getBudgetEntries = () =>
  pb.collection('budget_entries').getFullList<BudgetEntry>({ sort: '-created' })
