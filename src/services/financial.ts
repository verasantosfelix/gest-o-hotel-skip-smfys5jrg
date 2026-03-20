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
  category?: 'A/R' | 'A/P' | 'Other' | string
  issue_date?: string
  notes?: string
  document?: string
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

export interface FinancialContract {
  id: string
  name: string
  type: 'corporate' | 'supplier' | 'service' | string
  entity_name: string
  start_date: string
  end_date: string
  value: number
  currency: string
  status: 'active' | 'expired' | 'terminated' | string
  document?: string
  created: string
  updated: string
}

export interface FinancialAuditLog {
  id: string
  type: string
  status: string
  details: any
  error_count: number
  created: string
}

export const getFinancialDocs = () =>
  pb.collection('financial_docs').getFullList<FinancialDoc>({ sort: '-created' })

export const createFinancialDoc = (data: Partial<FinancialDoc>) =>
  pb.collection('financial_docs').create<FinancialDoc>(data)

export const updateFinancialDoc = (id: string, data: Partial<FinancialDoc>) =>
  pb.collection('financial_docs').update<FinancialDoc>(id, data)

export const getBudgetEntries = () =>
  pb.collection('budget_entries').getFullList<BudgetEntry>({ sort: '-created' })

export const getFinancialContracts = () =>
  pb.collection('financial_contracts').getFullList<FinancialContract>({ sort: '-created' })

export const createFinancialContract = (data: Partial<FinancialContract>) =>
  pb.collection('financial_contracts').create<FinancialContract>(data)

export const updateFinancialContract = (id: string, data: Partial<FinancialContract>) =>
  pb.collection('financial_contracts').update<FinancialContract>(id, data)

export const getFinancialAuditLogs = () =>
  pb.collection('financial_audit_logs').getFullList<FinancialAuditLog>({ sort: '-created' })
