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
  valor: number
  data_registro: string
}

interface ReservationStore {
  reservations: Reservation[]
  consumptions: Consumption[]
  addReservation: (res: Reservation) => void
  updateReservationStatus: (id: string, status: ReservationStatus, room?: string) => void
  addConsumption: (cons: Consumption) => void
  getConsumptionsByReservation: (reserva_id: string) => Consumption[]
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
    valor: 8.5,
    data_registro: new Date().toISOString(),
  },
  {
    id: 'c2',
    reserva_id: '12345',
    categoria: 'Restaurante',
    descricao: 'Jantar Executivo',
    valor: 142.0,
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
