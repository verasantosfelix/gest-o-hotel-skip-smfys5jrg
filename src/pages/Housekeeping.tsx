import { useState } from 'react'
import { CheckCircle2, PlayCircle, SprayCan, Hammer, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import useRoomStore, { CleaningStatus } from '@/stores/useRoomStore'
import useAuthStore from '@/stores/useAuthStore'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Housekeeping() {
  const { userRole } = useAuthStore()
  const { hasAccess } = useAccess()
  const { rooms, updateRoomStatus } = useRoomStore()
  const [tab, setTab] = useState<CleaningStatus | 'Todas'>('Todas')
  const isMobile = useIsMobile()

  if (!hasAccess(['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin'])) {
    return (
      <RestrictedAccess
        requiredRoles={['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin']}
      />
    )
  }

  const isLimpezaRole = userRole === 'Lavanderia_Limpeza'

  const handleUpdateStatus = (id: string, newStatus: CleaningStatus, num: string) => {
    updateRoomStatus(id, newStatus)
    toast({
      title: 'Status Atualizado',
      description: `Quarto ${num} marcado como ${newStatus}.`,
    })
  }

  if (isLimpezaRole && isMobile) {
    return (
      <div className="space-y-4 bg-slate-50 min-h-[calc(100vh-64px)] pb-24 -m-4 md:-m-6 p-4">
        <h1 className="text-xl font-bold text-slate-900 px-1 pt-2">Meus Quartos (On-the-go)</h1>
        <div className="grid gap-4">
          {rooms.map((room) => (
            <Card key={room.id} className="shadow-sm border-slate-200 overflow-hidden">
              <div
                className={`h-1.5 w-full ${room.cleaningStatus === 'Sujo' ? 'bg-rose-500' : 'bg-slate-500'}`}
              />
              <CardContent className="p-5 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                    Q.{room.num}
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-sm px-3 py-1 bg-slate-100 font-bold uppercase"
                  >
                    {room.cleaningStatus}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    className="h-16 text-lg font-bold bg-emerald-600 text-white min-h-[44px]"
                    onClick={() => handleUpdateStatus(room.id, 'Limpo', room.num)}
                    disabled={room.cleaningStatus === 'Limpo'}
                  >
                    Cleaned (Pronto)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const filteredRooms = tab === 'Todas' ? rooms : rooms.filter((r) => r.cleaningStatus === tab)

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <SprayCan className="w-6 h-6 text-primary" /> Painel de Governança
          </h1>
        </div>
      </div>

      <Tabs defaultValue="Todas" className="w-full" onValueChange={(v) => setTab(v as any)}>
        <TabsList className="mb-4 h-12 w-full sm:w-auto bg-slate-100 flex overflow-x-auto justify-start">
          <TabsTrigger value="Todas" className="flex-1 h-9">
            Todas
          </TabsTrigger>
          <TabsTrigger value="Sujo" className="flex-1 h-9">
            Sujos
          </TabsTrigger>
          <TabsTrigger value="Em Limpeza" className="flex-1 h-9">
            Em Execução
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0 outline-none">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="border-slate-200 shadow-sm relative flex flex-col">
                <CardHeader className="pb-3 pl-6">
                  <CardTitle className="text-2xl font-bold text-slate-800">{room.num}</CardTitle>
                </CardHeader>
                <CardContent className="py-4 pl-6 flex-1">
                  <Badge variant="outline">{room.cleaningStatus}</Badge>
                </CardContent>
                <CardFooter className="pt-2 pb-4 pl-6 flex flex-col gap-2">
                  <Button
                    className="w-full bg-slate-900 text-white"
                    onClick={() => handleUpdateStatus(room.id, 'Em Limpeza', room.num)}
                  >
                    Iniciar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-slate-600"
                    onClick={() => handleUpdateStatus(room.id, 'Manutenção', room.num)}
                  >
                    Manutenção
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
