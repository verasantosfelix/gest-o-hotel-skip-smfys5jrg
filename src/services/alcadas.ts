import pb from '@/lib/pocketbase/client'

export type PendingItem = {
  id: string
  collectionName: string
  date: string
  requesterName: string
  module: string
  description: string
  amount?: number
  status: string
}

export const getPendingApprovals = async (): Promise<PendingItem[]> => {
  const items: PendingItem[] = []

  // 1. Financial Docs
  try {
    const docs = await pb
      .collection('financial_docs')
      .getFullList({ filter: 'status = "pending" || status = "pending_approval"' })
    docs.forEach((d) => {
      items.push({
        id: d.id,
        collectionName: 'financial_docs',
        date: d.created,
        requesterName: d.entity_name || 'Sistema',
        module: 'Financeiro',
        description: `${d.doc_type} - ${d.category || 'Despesas'}`,
        amount: d.amount,
        status: d.status,
      })
    })
  } catch (e) {
    console.error('Error fetching financial docs pending', e)
  }

  // 2. Security Incidents
  try {
    const incidents = await pb
      .collection('security_incidents')
      .getFullList({ filter: 'status = "pending"' })
    incidents.forEach((d) => {
      items.push({
        id: d.id,
        collectionName: 'security_incidents',
        date: d.created,
        requesterName: d.involved || 'Equipe de Segurança',
        module: 'Segurança',
        description: `Incidente: ${d.category} - ${d.type} na ${d.location}`,
        status: d.status,
      })
    })
  } catch (e) {
    console.error('Error fetching security pending', e)
  }

  // 3. HR Candidates
  try {
    const hr = await pb.collection('hr_candidates').getFullList({ filter: 'status = "pending"' })
    hr.forEach((d) => {
      items.push({
        id: d.id,
        collectionName: 'hr_candidates',
        date: d.created,
        requesterName: d.name,
        module: 'RH',
        description: `Aprovação de candidato para ${d.cargo}`,
        status: d.status,
      })
    })
  } catch (e) {
    console.error('Error fetching HR pending', e)
  }

  // 4. Maintenance Tickets
  try {
    const tickets = await pb
      .collection('maintenance_tickets')
      .getFullList({ filter: 'status = "open"' })
    tickets.forEach((d) => {
      items.push({
        id: d.id,
        collectionName: 'maintenance_tickets',
        date: d.created,
        requesterName: d.requester_name || 'Solicitante OS',
        module: 'Manutenção',
        description: d.description,
        status: d.status,
      })
    })
  } catch (e) {
    console.error('Error fetching Maintenance pending', e)
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const updateApprovalStatus = async (
  collectionName: string,
  id: string,
  newStatus: string,
) => {
  return pb.collection(collectionName).update(id, { status: newStatus })
}
