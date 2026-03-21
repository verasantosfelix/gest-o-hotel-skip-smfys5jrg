import { useState, useEffect } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getFBMenuCategories,
  createFBMenuCategory,
  updateFBMenuCategory,
  deleteFBMenuCategory,
  FBMenuCategory,
} from '@/services/fnb'
import { logAuditAction } from '@/services/audit'
import { toast } from '@/components/ui/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

export function MenuCategoriesManager() {
  const [categories, setCategories] = useState<FBMenuCategory[]>([])
  const [newName, setNewName] = useState('')

  const loadData = async () => {
    try {
      setCategories(await getFBMenuCategories())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_menu_categories', loadData)

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order)) + 1 : 1
      const newCat = await createFBMenuCategory({ name: newName, order: nextOrder })
      logAuditAction('CREATE_CATEGORY', 'Menu Digital', { category: newName })
      toast({ title: 'Categoria criada' })
      setNewName('')
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    }
  }

  const handleDelete = async (cat: FBMenuCategory) => {
    if (!window.confirm(`Apagar categoria ${cat.name}?`)) return
    try {
      await deleteFBMenuCategory(cat.id)
      logAuditAction('DELETE_CATEGORY', 'Menu Digital', { category: cat.name })
      toast({ title: 'Categoria apagada' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao apagar. Pode haver itens vinculados.', variant: 'destructive' })
    }
  }

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === categories.length - 1) return

    const newCats = [...categories]
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    const tempOrder = newCats[index].order
    newCats[index].order = newCats[swapIndex].order
    newCats[swapIndex].order = tempOrder

    try {
      await Promise.all([
        updateFBMenuCategory(newCats[index].id, { order: newCats[index].order }),
        updateFBMenuCategory(newCats[swapIndex].id, { order: newCats[swapIndex].order }),
      ])
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' })
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm max-w-4xl">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-lg">Categorias do Menu</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex gap-4">
          <Input
            placeholder="Nome da nova categoria"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-center">Ordem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c, idx) => (
              <TableRow key={c.id}>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => moveOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="disabled:opacity-30 hover:bg-slate-100 p-1 rounded"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs">{c.order}</span>
                    <button
                      onClick={() => moveOrder(idx, 'down')}
                      disabled={idx === categories.length - 1}
                      className="disabled:opacity-30 hover:bg-slate-100 p-1 rounded"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-base">{c.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600"
                    onClick={() => handleDelete(c)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Nenhuma categoria cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
