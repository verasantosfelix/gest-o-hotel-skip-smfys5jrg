import pb from '@/lib/pocketbase/client'
export const getBudgetEntries = () =>
  pb.collection('budget_entries').getFullList({ sort: '-created' })
export const createBudgetEntry = (data: any) => pb.collection('budget_entries').create(data)
