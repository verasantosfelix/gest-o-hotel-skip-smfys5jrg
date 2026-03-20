import pb from '@/lib/pocketbase/client'
export const getFinancialDocs = () =>
  pb.collection('financial_docs').getFullList({ sort: '-created' })
export const createFinancialDoc = (data: any) => pb.collection('financial_docs').create(data)
