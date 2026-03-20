import React, { createContext, useContext, useState } from 'react'
import useAuditStore from './useAuditStore'

export type InventoryItem = {
  id: string
  name: string
  category: 'Minibar' | 'Restaurante' | 'Serviços Extras' | 'Outros'
  quantity: number
  threshold: number
  price: number
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Água sem gás',
    category: 'Minibar',
    quantity: 4,
    threshold: 10,
    price: 8.5,
  },
  { id: 'inv-2', name: 'Coca-Cola', category: 'Minibar', quantity: 24, threshold: 10, price: 12.0 },
  { id: 'inv-3', name: 'Amendoim', category: 'Minibar', quantity: 2, threshold: 5, price: 15.0 },
  {
    id: 'inv-4',
    name: 'Jantar Executivo',
    category: 'Restaurante',
    quantity: 999,
    threshold: 0,
    price: 75.0,
  },
  {
    id: 'inv-5',
    name: 'Massagem Relaxante',
    category: 'Serviços Extras',
    quantity: 999,
    threshold: 0,
    price: 120.0,
  },
]

interface InventoryStore {
  items: InventoryItem[]
  decrementStock: (id: string, qty: number) => void
  updateItem: (id: string, item: Partial<InventoryItem>) => void
}

const InventoryContext = createContext<InventoryStore | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY)

  const decrementStock = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity - qty) } : item,
      ),
    )
  }

  const updateItem = (id: string, data: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)))
  }

  return React.createElement(
    InventoryContext.Provider,
    { value: { items, decrementStock, updateItem } },
    children,
  )
}

export default function useInventoryStore() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventoryStore must be used within an InventoryProvider')
  }
  return context
}
