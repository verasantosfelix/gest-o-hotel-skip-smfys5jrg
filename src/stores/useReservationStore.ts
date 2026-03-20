import React, { createContext, useContext, useState } from 'react'

export type ReservationStatus = 'pending' | 'checked-in' | 'checked-out'
export type ConsumptionCategory = 'Minibar' | 'Restaurante' | 'Serviços Extras'

export type Reservation = {
  id: string
  guestName: string
  room: string
  status: ReservationStatus
}

export type Consumption = {
  id: string
  reserva_id: string
  categoria: ConsumptionCategory
  descricao: string
  quantidade: number
  preco_unitario: number
  desconto: number
  motivo_desconto?: string
  valor: number
  validacao_hospede: boolean
  data_registro: string
}

interface ReservationStore {
  reservations: Reservation[]
  consumptions: Consumption[]
  addReservation: (res: Reservation) => void
  updateReservationStatus: (id: string, status: ReservationStatus, room?: string) => void
  addConsumption: (cons: Consumption) => void
  getConsumptionsByReservation: (reserva_id: string) => Consumption[]
  validateConsumption: (id: string) => void
}

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: '12345', guestName: 'João Silva', room: '304', status: 'checked-in' },
  { id: '99999', guestName: 'Maria Oliveira', room: '102', status: 'checked-in' },
]

const INITIAL_CONSUMPTIONS: Consumption[] = [
  {
    id: 'c1',
    reserva_id: '12345',
    categoria: 'Minibar',
    descricao: 'Água sem gás',
    quantidade: 1,
    preco_unitario: 8.5,
    desconto: 0,
    valor: 8.5,
    validacao_hospede: true,
    data_registro: new Date().toISOString(),
  },
  {
    id: 'c2',
    reserva_id: '12345',
    categoria: 'Restaurante',
    descricao: 'Jantar Executivo',
    quantidade: 2,
    preco_unitario: 75.0,
    desconto: 15.0,
    motivo_desconto: 'Perfil VIP (10%)',
    valor: 135.0,
    validacao_hospede: true,
    data_registro: new Date().toISOString(),
  },
  {
    id: 'c4',
    reserva_id: '12345',
    categoria: 'Minibar',
    descricao: 'Amendoim',
    quantidade: 1,
    preco_unitario: 15.0,
    desconto: 0,
    valor: 15.0,
    validacao_hospede: false,
    data_registro: new Date().toISOString(),
  },
]

const ReservationContext = createContext<ReservationStore | undefined>(undefined)

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS)
  const [consumptions, setConsumptions] = useState<Consumption[]>(INITIAL_CONSUMPTIONS)

  const addReservation = (res: Reservation) => setReservations((prev) => [...prev, res])

  const updateReservationStatus = (id: string, status: ReservationStatus, room?: string) =>
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, ...(room ? { room } : {}) } : r)),
    )

  const addConsumption = (cons: Consumption) => setConsumptions((prev) => [...prev, cons])

  const validateConsumption = (id: string) => {
    setConsumptions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, validacao_hospede: true } : c)),
    )
  }

  const getConsumptionsByReservation = (reserva_id: string) =>
    consumptions.filter((c) => c.reserva_id === reserva_id)

  return React.createElement(
    ReservationContext.Provider,
    {
      value: {
        reservations,
        consumptions,
        addReservation,
        updateReservationStatus,
        addConsumption,
        getConsumptionsByReservation,
        validateConsumption,
      },
    },
    children,
  )
}

export default function useReservationStore() {
  const context = useContext(ReservationContext)
  if (!context) {
    throw new Error('useReservationStore must be used within a ReservationProvider')
  }
  return context
}
