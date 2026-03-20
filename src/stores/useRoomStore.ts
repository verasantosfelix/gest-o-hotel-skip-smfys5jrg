import React, { createContext, useContext, useState } from 'react'
import useAuditStore from './useAuditStore'

export type RoomStatus = 'Livre' | 'Ocupado' | 'Bloqueado'
export type CleaningStatus = 'Limpo' | 'Sujo' | 'Em Limpeza' | 'Manutenção'

export type Room = {
  id: string
  num: string
  type: string
  status: RoomStatus
  cleaningStatus: CleaningStatus
  occupancy?: string
  guestName?: string
  checkOutDate?: string
  history: string[]
}

const today = new Date().toISOString().split('T')[0]

const INITIAL_ROOMS: Room[] = [
  {
    id: '1',
    num: '101',
    type: 'Standard',
    status: 'Livre',
    cleaningStatus: 'Limpo',
    history: ['Limpo hoje às 10:00'],
  },
  {
    id: '2',
    num: '102',
    type: 'Standard',
    status: 'Livre',
    cleaningStatus: 'Sujo',
    history: ['Checkout finalizado'],
  },
  {
    id: '3',
    num: '103',
    type: 'Standard',
    status: 'Ocupado',
    cleaningStatus: 'Sujo',
    occupancy: 'Reserva #8492',
    guestName: 'João Silva',
    history: ['Check-in 14:00'],
  },
  { id: '4', num: '201', type: 'Luxo', status: 'Livre', cleaningStatus: 'Limpo', history: [] },
  {
    id: '5',
    num: '202',
    type: 'Luxo',
    status: 'Livre',
    cleaningStatus: 'Manutenção',
    history: ['Ar condicionado com defeito'],
  },
  {
    id: '6',
    num: '301',
    type: 'Suite',
    status: 'Ocupado',
    cleaningStatus: 'Limpo',
    occupancy: 'Reserva #9999',
    guestName: 'Maria Silva',
    history: [],
  },
  {
    id: '7',
    num: '302',
    type: 'Suite',
    status: 'Ocupado',
    cleaningStatus: 'Em Limpeza',
    occupancy: 'Reserva #1024',
    checkOutDate: today,
    history: ['Aguardando liberação'],
  },
]

interface RoomStore {
  rooms: Room[]
  updateRoomStatus: (
    id: string,
    cleaningStatus?: CleaningStatus,
    status?: RoomStatus,
    reason?: string,
  ) => void
}

const RoomContext = createContext<RoomStore | undefined>(undefined)

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
  const { addLog } = useAuditStore()

  const updateRoomStatus = (
    id: string,
    cleaningStatus?: CleaningStatus,
    status?: RoomStatus,
    reason?: string,
  ) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const changes = []
          if (cleaningStatus) changes.push(`Limpeza: ${cleaningStatus}`)
          if (status) changes.push(`Status: ${status}`)
          if (reason) changes.push(`Motivo: ${reason}`)

          const timestamp = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
          const newHistory = [`${timestamp} - ${changes.join(', ')}`, ...r.history]

          addLog('ROOM_UPDATE', `Quarto ${r.num} atualizado: ${changes.join(', ')}`)

          return {
            ...r,
            ...(cleaningStatus && { cleaningStatus }),
            ...(status && { status }),
            history: newHistory,
          }
        }
        return r
      }),
    )
  }

  return React.createElement(RoomContext.Provider, { value: { rooms, updateRoomStatus } }, children)
}

export default function useRoomStore() {
  const context = useContext(RoomContext)
  if (!context) {
    throw new Error('useRoomStore must be used within a RoomProvider')
  }
  return context
}
