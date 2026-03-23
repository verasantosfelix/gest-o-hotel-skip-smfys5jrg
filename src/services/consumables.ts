import pb from '@/lib/pocketbase/client'

export interface ConsumableItem {
  id: string
  item_name: string
  category: 'minibar' | 'hygiene'
  stock_quantity: number
  unit_price: number
  min_threshold: number
  created: string
  updated: string
}

export const getConsumables = () =>
  pb.collection('consumables_inventory').getFullList<ConsumableItem>({ sort: 'category,item_name' })

export const createConsumable = (data: Partial<ConsumableItem>) =>
  pb.collection('consumables_inventory').create<ConsumableItem>(data)

export const updateConsumable = (id: string, data: Partial<ConsumableItem>) =>
  pb.collection('consumables_inventory').update<ConsumableItem>(id, data)

export const deleteConsumable = (id: string) => pb.collection('consumables_inventory').delete(id)
