import React, { createContext, useContext, useState } from 'react'

export type ApprovalRequest = {
  id: string
  type: 'F&B' | 'Reservation'
  description: string
  originalAmount: number
  discountPercent: number
  discountAmount: number
  finalAmount: number
  requesterName: string
  requesterRole: string
  status: 'pending' | 'approved' | 'denied'
  timestamp: string
  managerName?: string
  resolvedAt?: string
}

interface ApprovalStore {
  approvals: ApprovalRequest[]
  addRequest: (req: Omit<ApprovalRequest, 'id' | 'status' | 'timestamp'>) => void
  resolveRequest: (id: string, status: 'approved' | 'denied', managerName: string) => void
}

const ApprovalContext = createContext<ApprovalStore | undefined>(undefined)

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])

  const addRequest = (req: Omit<ApprovalRequest, 'id' | 'status' | 'timestamp'>) => {
    setApprovals((prev) => [
      {
        ...req,
        id: Math.random().toString(36).substring(2, 9),
        status: 'pending',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const resolveRequest = (id: string, status: 'approved' | 'denied', managerName: string) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status, managerName, resolvedAt: new Date().toISOString() } : a,
      ),
    )
  }

  return React.createElement(
    ApprovalContext.Provider,
    { value: { approvals, addRequest, resolveRequest } },
    children,
  )
}

export default function useApprovalStore() {
  const ctx = useContext(ApprovalContext)
  if (!ctx) {
    throw new Error('useApprovalStore must be used within an ApprovalProvider')
  }
  return ctx
}
