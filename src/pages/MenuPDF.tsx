import { FileText, Layers, Clock, CheckCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

import { MenuPDFTemplates } from '@/components/fnb/MenuPDFTemplates'
import { MenuPDFVersions } from '@/components/fnb/MenuPDFVersions'
import { MenuPDFSchedules } from '@/components/fnb/MenuPDFSchedules'

export default function MenuPDF() {
  const { hasAccess } = useAccess()

  if (!hasAccess(['Restaurante_Bar', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Restaurante_Bar', 'Direcao_Admin']} />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-100 rounded-lg shadow-sm border border-rose-200">
          <FileText className="w-6 h-6 text-rose-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Menu Impresso & PDFs</h1>
          <p className="text-sm text-slate-500">
            Motor de templates, aprovação de versões e agendamento de impressões.
          </p>
        </div>
      </div>

      <Tabs defaultValue="versions" className="w-full">
        <TabsList className="mb-6 h-auto bg-slate-100 flex flex-wrap justify-start border border-slate-200 shadow-sm p-1 rounded-md">
          <TabsTrigger value="versions" className="px-4 py-2 font-medium gap-2">
            <CheckCircle className="w-4 h-4" /> Versões & Aprovações
          </TabsTrigger>
          <TabsTrigger value="templates" className="px-4 py-2 font-medium gap-2">
            <Layers className="w-4 h-4" /> Configurar Templates
          </TabsTrigger>
          <TabsTrigger value="schedules" className="px-4 py-2 font-medium gap-2">
            <Clock className="w-4 h-4" /> Automação & Agendamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="mt-0 outline-none">
          <MenuPDFVersions />
        </TabsContent>

        <TabsContent value="templates" className="mt-0 outline-none">
          <MenuPDFTemplates />
        </TabsContent>

        <TabsContent value="schedules" className="mt-0 outline-none">
          <MenuPDFSchedules />
        </TabsContent>
      </Tabs>
    </div>
  )
}
