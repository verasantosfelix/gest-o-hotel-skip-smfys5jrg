import React, { createContext, useContext, useState } from 'react'

export type AuditLog = {
  id: string
  timestamp: string
  action: string
  details: string
}

interface AuditStore {
  logs: AuditLog[]
  addLog: (action: string, details: string) => void
}

const AuditContext = createContext<AuditStore | undefined>(undefined)

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([])

  const addLog = (action: string, details: string) => {
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      action,
      details,
    }
    setLogs((prev) => [newLog, ...prev])
    console.log(`[AUDIT LOG] ${newLog.timestamp} | ${action} | ${details}`)
  }

  return React.createElement(AuditContext.Provider, { value: { logs, addLog } }, children)
}

export default function useAuditStore() {
  const context = useContext(AuditContext)
  if (!context) {
    throw new Error('useAuditStore must be used within an AuditProvider')
  }
  return context
}
