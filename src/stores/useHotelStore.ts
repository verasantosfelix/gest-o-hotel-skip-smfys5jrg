import React, { createContext, useContext, useState } from 'react'

export type Hotel = {
  id: string
  name: string
  location: string
}

const HOTELS: Hotel[] = [
  { id: '1', name: 'SKIP Premium Centro', location: 'São Paulo, SP' },
  { id: '2', name: 'SKIP Resort Litoral', location: 'Florianópolis, SP' },
]

interface HotelStore {
  selectedHotel: Hotel
  setSelectedHotel: (hotel: Hotel) => void
  hotels: Hotel[]
}

const HotelContext = createContext<HotelStore | undefined>(undefined)

export function HotelProvider({ children }: { children: React.ReactNode }) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel>(HOTELS[0])

  return React.createElement(
    HotelContext.Provider,
    {
      value: { selectedHotel, setSelectedHotel, hotels: HOTELS },
    },
    children,
  )
}

export default function useHotelStore() {
  const context = useContext(HotelContext)
  if (!context) {
    throw new Error('useHotelStore must be used within a HotelProvider')
  }
  return context
}
