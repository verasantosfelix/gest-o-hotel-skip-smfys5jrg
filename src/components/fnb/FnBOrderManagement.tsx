import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  getFBTables,
  FBTable,
  updateFBTable,
  createFBTable,
  deleteFBTable,
  getFBLayoutPresets,
  createFBPreset,
  updateFBPreset,
  FBLayoutPreset,
  getFBLayoutElements,
  createFBLayoutElement,
  updateFBLayoutElement,
  deleteFBLayoutElement,
  FBLayoutElement,
} from '@/services/fnb'
import { useRealtime } from '@/hooks/use-realtime'
import { FnBTableDialog } from './FnBTableDialog'
import { FnBFloorPlan } from './FnBFloorPlan'
import useAuthStore from '@/stores/useAuthStore'
import { useAccess } from '@/hooks/use-access'
import { LayoutGrid, Map } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export function FnBOrderManagement() {
  const { profile } = useAuthStore()
  const { isManager } = useAccess()
  const isFrontDeskProfile =
    profile?.name === 'Front_Desk' || profile?.name === 'Rececao_FrontOffice'
  const isFrontDeskStaffOnly = isFrontDeskProfile && !isManager()

  const [tables, setTables] = useState<FBTable[]>([])
  const [elements, setElements] = useState<FBLayoutElement[]>([])
  const [presets, setPresets] = useState<FBLayoutPreset[]>([])
  const [selectedPresetId, setSelectedPresetId] = useState<string>('')

  const [selectedTable, setSelectedTable] = useState<FBTable | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map')

  const [showNewPresetDialog, setShowNewPresetDialog] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')

  const loadData = useCallback(
    async (presetIdToLoad: string) => {
      try {
        const p = await getFBLayoutPresets()
        setPresets(p)

        let targetId = presetIdToLoad
        if (!targetId || isFrontDeskStaffOnly) {
          const active = p.find((x) => x.is_active)
          targetId = active?.id || p[0]?.id || ''
          if (targetId !== presetIdToLoad) {
            setSelectedPresetId(targetId)
            return
          }
        }

        if (targetId) {
          setTables(await getFBTables(targetId))
          setElements(await getFBLayoutElements(targetId))
        }
      } catch (e) {
        console.error(e)
      }
    },
    [isFrontDeskStaffOnly],
  )

  useEffect(() => {
    loadData(selectedPresetId)
  }, [selectedPresetId, loadData])

  useRealtime('fb_tables', () => loadData(selectedPresetId))
  useRealtime('fb_layout_presets', () => loadData(selectedPresetId))
  useRealtime('fb_layout_elements', () => loadData(selectedPresetId))

  const handleMakeActive = async () => {
    try {
      const activePresets = presets.filter((p) => p.is_active)
      for (const ap of activePresets) {
        if (ap.id !== selectedPresetId) await updateFBPreset(ap.id, { is_active: false })
      }
      await updateFBPreset(selectedPresetId, { is_active: true })
      toast({ title: 'Preset definido como padrão' })
      loadData(selectedPresetId)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreatePreset = async () => {
    if (!newPresetName) return
    try {
      const p = await createFBPreset({ name: newPresetName, is_active: false })
      for (const el of elements) {
        await createFBLayoutElement({
          type: el.type,
          label: el.label,
          pos_x: el.pos_x,
          pos_y: el.pos_y,
          width: el.width,
          height: el.height,
          rotation: el.rotation,
          preset_id: p.id,
        })
      }
      for (const t of tables) {
        await createFBTable({
          table_number: t.table_number,
          status: 'free',
          capacity: t.capacity,
          pos_x: t.pos_x,
          pos_y: t.pos_y,
          width: t.width,
          height: t.height,
          rotation: t.rotation,
          preset_id: p.id,
        })
      }
      toast({ title: 'Preset criado com sucesso!' })
      setShowNewPresetDialog(false)
      setNewPresetName('')
      setSelectedPresetId(p.id)
    } catch (e) {
      console.error(e)
      toast({ title: 'Erro ao criar preset', variant: 'destructive' })
    }
  }

  const handleUpdateTable = async (id: string, updates: Partial<FBTable>) => {
    try {
      await updateFBTable(id, updates)
    } catch (e) {
      toast({ title: 'Erro ao salvar layout da mesa', variant: 'destructive' })
    }
  }
  const handleDeleteTable = async (id: string) => {
    try {
      await deleteFBTable(id)
    } catch (e) {
      toast({ title: 'Erro ao remover mesa', variant: 'destructive' })
    }
  }
  const handleAddTable = async (x: number = 200, y: number = 200) => {
    if (!selectedPresetId) return
    try {
      await createFBTable({
        table_number: `T${tables.length + 1}`,
        status: 'free',
        capacity: 4,
        pos_x: Math.round(x),
        pos_y: Math.round(y),
        width: 80,
        height: 80,
        rotation: 0,
        preset_id: selectedPresetId,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateElement = async (id: string, updates: Partial<FBLayoutElement>) => {
    try {
      await updateFBLayoutElement(id, updates)
    } catch (e) {
      toast({ title: 'Erro ao salvar elemento', variant: 'destructive' })
    }
  }
  const handleDeleteElement = async (id: string) => {
    try {
      await deleteFBLayoutElement(id)
    } catch (e) {
      toast({ title: 'Erro ao remover elemento', variant: 'destructive' })
    }
  }
  const handleAddElement = async (type: string, x: number = 150, y: number = 150) => {
    if (!selectedPresetId) return
    try {
      await createFBLayoutElement({
        type: type as any,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        pos_x: Math.round(x),
        pos_y: Math.round(y),
        width: type === 'column' ? 60 : 100,
        height: type === 'wall' ? 20 : type === 'column' ? 60 : 100,
        rotation: 0,
        preset_id: selectedPresetId,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const activePreset = presets.find((p) => p.id === selectedPresetId)

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 shrink-0">Layout de Mesas</h2>
            {!isFrontDeskStaffOnly && (
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
                  <SelectTrigger className="w-48 bg-white border-slate-200 h-9">
                    <SelectValue placeholder="Selecione um Preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.is_active && '(Ativo)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!activePreset?.is_active && (
                  <Button variant="outline" size="sm" onClick={handleMakeActive} className="h-9">
                    Tornar Padrão
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowNewPresetDialog(true)}
                  className="h-9"
                >
                  Novo Preset
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
            <div className="flex gap-2 text-xs">
              <Badge
                variant="outline"
                className="bg-emerald-50 border-emerald-200 text-emerald-700"
              >
                Livre
              </Badge>
              <Badge variant="outline" className="bg-rose-50 border-rose-200 text-rose-700">
                Ocupada
              </Badge>
              <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                Reservada
              </Badge>
            </div>
            <TabsList className="bg-slate-100 border border-slate-200 h-auto p-1">
              <TabsTrigger value="grid" className="gap-2 px-4 py-2 font-medium">
                <LayoutGrid className="w-4 h-4" /> Lista
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2 px-4 py-2 font-medium">
                <Map className="w-4 h-4" /> Planta 2D
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="grid" className="mt-0 outline-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((t) => {
              const isOcc = t.status === 'occupied'
              const isRes = t.status === 'reserved'
              return (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${isOcc ? 'border-rose-300 bg-rose-50/50' : isRes ? 'border-orange-300 bg-orange-50/50' : 'border-emerald-200 bg-emerald-50/20'}`}
                  onClick={() => {
                    if (!isFrontDeskStaffOnly) setSelectedTable(t)
                  }}
                >
                  <CardContent className="p-6 text-center flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isOcc ? 'bg-rose-200 text-rose-800' : isRes ? 'bg-orange-200 text-orange-800' : 'bg-emerald-200 text-emerald-800'}`}
                    >
                      <span className="font-black text-xl">{t.table_number.replace('T', '')}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Mesa {t.table_number}</h3>
                    <Badge
                      variant="outline"
                      className="mt-2 text-[10px] uppercase tracking-widest bg-white"
                    >
                      {t.status}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-2">{t.capacity} lugares</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-0 outline-none">
          <FnBFloorPlan
            tables={tables}
            elements={elements}
            onTableClick={(t) => {
              if (!isFrontDeskStaffOnly) setSelectedTable(t)
            }}
            canEdit={!isFrontDeskStaffOnly}
            onUpdateTable={handleUpdateTable}
            onDeleteTable={handleDeleteTable}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onAddElement={handleAddElement}
            onAddTable={handleAddTable}
          />
        </TabsContent>
      </Tabs>

      {selectedTable && (
        <FnBTableDialog table={selectedTable} onClose={() => setSelectedTable(null)} />
      )}

      <Dialog open={showNewPresetDialog} onOpenChange={setShowNewPresetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar como Novo Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Nome do Layout (ex: Jantar Casamento)"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
            />
            <Button
              onClick={handleCreatePreset}
              className="w-full bg-slate-900 hover:bg-black text-white"
            >
              Clonar Layout Atual e Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
