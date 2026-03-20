import {
  CalendarRange,
  LayoutDashboard,
  Settings,
  Sparkles,
  Building,
  BarChart,
} from 'lucide-react'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { EventsDashboard } from '@/components/events/EventsDashboard'
import { EventSpaces } from '@/components/events/EventSpaces'
import { EventOperations } from '@/components/events/EventOperations'
import { EventWizard } from '@/components/events/EventWizard'
import { EventsKPIs } from '@/components/events/EventsKPIs'

export default function Events() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Rececao_FrontOffice', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Rececao_FrontOffice', 'Direcao_Admin']} />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg shadow-sm border border-purple-200">
          <CalendarRange className="w-6 h-6 text-purple-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Eventos & Conferências (MICE)
          </h1>
          <p className="text-sm text-slate-500">
            Gestão de salões, propostas e ciclo de vida de eventos
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 h-auto bg-slate-100 flex flex-wrap justify-start border border-slate-200 shadow-sm p-1 rounded-md">
          <TabsTrigger value="dashboard" className="px-4 py-2 font-medium gap-2">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="spaces" className="px-4 py-2 font-medium gap-2">
            <Building className="w-4 h-4" /> Salas e Espaços
          </TabsTrigger>
          <TabsTrigger value="wizard" className="px-4 py-2 font-medium gap-2">
            <Sparkles className="w-4 h-4" /> Novo Evento (Wizard)
          </TabsTrigger>
          <TabsTrigger value="operations" className="px-4 py-2 font-medium gap-2">
            <Settings className="w-4 h-4" /> Operações & Setup
          </TabsTrigger>
          <TabsTrigger value="kpis" className="px-4 py-2 font-medium gap-2">
            <BarChart className="w-4 h-4" /> Analytics & KPIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 outline-none">
          <EventsDashboard />
        </TabsContent>
        <TabsContent value="spaces" className="mt-0 outline-none">
          <EventSpaces />
        </TabsContent>
        <TabsContent value="wizard" className="mt-0 outline-none">
          <EventWizard />
        </TabsContent>
        <TabsContent value="operations" className="mt-0 outline-none">
          <EventOperations />
        </TabsContent>
        <TabsContent value="kpis" className="mt-0 outline-none">
          <EventsKPIs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
