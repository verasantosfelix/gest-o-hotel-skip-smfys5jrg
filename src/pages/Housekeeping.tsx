import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { CheckCircle2, PlayCircle, SprayCan, AlertTriangle, Hammer, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import useRoomStore, { CleaningStatus } from '@/stores/useRoomStore'
import useAuthStore from '@/stores/useAuthStore'

export default function Housekeeping() {
  const { userRole } = useAuthStore()
  const { rooms, updateRoomStatus } = useRoomStore()
  const [tab, setTab] = useState<CleaningStatus | 'Todas'>('Todas')

  if (userRole !== 'Admin' && userRole !== 'Administrativa' && userRole !== 'Limpeza') {
    return <Navigate to="/" replace />
  }

  const isLimpezaRole = userRole === 'Limpeza'

  const handleUpdateStatus = (id: string, newStatus: CleaningStatus, num: string) => {
    updateRoomStatus(id, newStatus)
    toast({
      title: 'Status Atualizado',
      description: `Quarto ${num} marcado como ${newStatus}.`,
    })
  }

  const filteredRooms = tab === 'Todas' ? rooms : rooms.filter((r) => r.cleaningStatus === tab)

  const getStatusColor = (status: CleaningStatus) => {
    switch (status) {
      case 'Sujo':
        return 'bg-rose-500/10 text-rose-700 border-rose-200'
      case 'Em Limpeza':
        return 'bg-amber-500/10 text-amber-700 border-amber-200'
      case 'Limpo':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
      case 'Manutenção':
        return 'bg-slate-500/10 text-slate-700 border-slate-300'
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <SprayCan className="w-6 h-6 text-primary" />
            Painel de Governança
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestão operacional de limpeza e preparação de quartos.
          </p>
        </div>
      </div>

      <Tabs defaultValue="Todas" className="w-full" onValueChange={(v) => setTab(v as any)}>
        <TabsList className="mb-4 h-12 w-full sm:w-auto bg-slate-100 flex overflow-x-auto justify-start">
          <TabsTrigger value="Todas" className="flex-1 h-9 data-[state=active]:shadow-sm">
            Todas
          </TabsTrigger>
          <TabsTrigger value="Sujo" className="flex-1 h-9 data-[state=active]:shadow-sm">
            Sujos
          </TabsTrigger>
          <TabsTrigger value="Em Limpeza" className="flex-1 h-9 data-[state=active]:shadow-sm">
            Em Execução
          </TabsTrigger>
          <TabsTrigger value="Limpo" className="flex-1 h-9 data-[state=active]:shadow-sm">
            Limpos
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0 outline-none">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRooms.map((room) => (
              <Card
                key={room.id}
                className="border-slate-200 shadow-sm relative overflow-hidden flex flex-col transition-all hover:shadow-md"
              >
                <div
                  className={`absolute top-0 left-0 w-1.5 h-full ${
                    room.cleaningStatus === 'Sujo'
                      ? 'bg-rose-500'
                      : room.cleaningStatus === 'Em Limpeza'
                        ? 'bg-amber-500'
                        : room.cleaningStatus === 'Limpo'
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                  }`}
                />
                <CardHeader className="pb-3 pl-6 flex flex-row items-start justify-between bg-slate-50/50">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800">{room.num}</CardTitle>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                      {room.type}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-semibold ${getStatusColor(room.cleaningStatus)}`}
                  >
                    {room.cleaningStatus}
                  </Badge>
                </CardHeader>
                <CardContent className="py-4 pl-6 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white text-slate-600">
                      {room.status === 'Livre' ? 'Vazio' : 'Ocupado'}
                    </Badge>
                    {room.checkOutDate === today && (
                      <Badge
                        variant="destructive"
                        className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-transparent"
                      >
                        Check-out Hoje
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4 pl-6 flex flex-col gap-2">
                  {room.cleaningStatus === 'Sujo' && (
                    <Button
                      className="w-full bg-slate-900 text-white hover:bg-slate-800 h-12 text-base"
                      onClick={() => handleUpdateStatus(room.id, 'Em Limpeza', room.num)}
                    >
                      <PlayCircle className="w-5 h-5 mr-2" /> Iniciar Limpeza
                    </Button>
                  )}
                  {room.cleaningStatus === 'Em Limpeza' && (
                    <Button
                      className="w-full bg-emerald-600 text-white hover:bg-emerald-700 h-12 text-base"
                      onClick={() => handleUpdateStatus(room.id, 'Limpo', room.num)}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Finalizar Limpeza
                    </Button>
                  )}
                  {room.cleaningStatus !== 'Manutenção' && (
                    <Button
                      variant="outline"
                      className="w-full text-slate-600 border-slate-300"
                      onClick={() => handleUpdateStatus(room.id, 'Manutenção', room.num)}
                    >
                      <Wrench className="w-4 h-4 mr-2" /> Reportar Manutenção
                    </Button>
                  )}
                  {room.cleaningStatus === 'Manutenção' && (
                    <div className="w-full bg-slate-100 text-slate-600 p-3 rounded-md text-center text-sm font-medium border border-slate-200 flex items-center justify-center gap-2">
                      <Hammer className="w-4 h-4" /> Em Reparo
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
            {filteredRooms.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Nenhum quarto encontrado para esta categoria no momento.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
