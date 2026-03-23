import { Navigate } from 'react-router-dom'
import { useState } from 'react'
import {
  BedDouble,
  ShieldCheck,
  Sparkles,
  LayoutGrid,
  RefreshCw,
  UserX,
  Clock,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import useAuthStore from '@/stores/useAuthStore'
import useHotelStore from '@/stores/useHotelStore'
import { useAccess } from '@/hooks/use-access'
import { FinancialDashboard } from '@/components/operations/FinancialDashboard'

import { FrontOfficeMain } from '@/components/front-office/FrontOfficeMain'
import { CheckIn } from '@/components/operations/CheckIn'
import { CheckOut } from '@/components/operations/CheckOut'
import { ShiftRoutines } from '@/components/front-office/ShiftRoutines'
import { FrontOfficeKPIs } from '@/components/front-office/FrontOfficeKPIs'

import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'

export default function Index() {
  const { profile, loadingProfile, profileError, retryLoadProfile } = useAuthStore()
  const { effectiveRoleLevel, effectiveAllowedActions } = useAccess()
  const { selectedHotel } = useHotelStore()
  const [activeTab, setActiveTab] = useState('dashboard')

  useRealtime('users', (e) => {
    if (e.record.id === pb.authStore.record?.id) {
      retryLoadProfile()
    }
  })

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 animate-pulse font-medium">Carregando dashboard...</p>
      </div>
    )
  }

  if (profileError) {
    const errorConfig = {
      suspended: {
        title: 'Conta Suspensa',
        desc: 'A sua conta foi desativada pelo administrador. Você não tem acesso ao sistema no momento.',
        icon: ShieldAlert,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
      },
      not_found: {
        title: 'Perfil Não Encontrado',
        desc: 'Perfil não encontrado. Por favor, contacte o administrador para associar um cargo à sua conta.',
        icon: UserX,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
      },
      forbidden: {
        title: 'Acesso Negado',
        desc: 'Você não tem permissão para carregar os dados deste perfil. Verifique com o suporte.',
        icon: AlertCircle,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
      },
      timeout: {
        title: 'Tempo Limite Excedido',
        desc: 'Não foi possível carregar os dados a tempo. Verifique sua conexão com a internet ou tente novamente.',
        icon: Clock,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
      },
    }[profileError]

    const Icon = errorConfig.icon

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Card className={`max-w-md w-full ${errorConfig.border} shadow-sm animate-fade-in-up`}>
          <CardContent className="p-6 text-center space-y-4">
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${errorConfig.bg}`}
            >
              <Icon className={`w-8 h-8 ${errorConfig.color}`} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{errorConfig.title}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{errorConfig.desc}</p>

            <div className="pt-4 flex justify-center">
              <Button onClick={retryLoadProfile} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) return null

  const isExecutive = ['Gerente_Geral', 'Director_Geral', 'Administrativo_Geral'].includes(
    effectiveRoleLevel,
  )

  const allowed = effectiveAllowedActions

  if (!isExecutive && !allowed.includes('Dashboard')) {
    if (allowed.includes('Reservas')) return <Navigate to="/reservas" replace />
    if (allowed.includes('Governança')) return <Navigate to="/governanca" replace />
    if (allowed.includes('F&B Básico')) return <Navigate to="/fnb" replace />
    if (allowed.includes('Agenda Diária')) return <Navigate to="/spa/agenda" replace />
    if (allowed.includes('Manutenção')) return <Navigate to="/manutencao" replace />
    if (allowed.includes('IT Admin')) return <Navigate to="/it-admin" replace />
    if (allowed.includes('Financeiro Corp')) return <Navigate to="/financeiro-corp" replace />
    if (allowed.includes('Menu Digital')) return <Navigate to="/restaurante/menu-digital" replace />
    if (allowed.includes('Relatórios')) return <Navigate to="/relatorios" replace />
  }

  if (isExecutive) {
    return (
      <div className="space-y-6 animate-fade-in-up pb-8">
        <div className="mb-4">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Executive Dashboard</h1>
          <p className="text-slate-500">
            Visão{' '}
            {effectiveRoleLevel === 'Director_Geral' ? 'Estratégica (Leitura)' : 'Operacional'} -{' '}
            {selectedHotel.name}
          </p>
        </div>
        <div className="grid lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <BedDouble className="w-6 h-6 mb-2 text-blue-600" />
              <p className="text-sm font-bold text-slate-600">Ocupação Global</p>
              <p className="text-3xl font-black text-slate-800 mt-1">82%</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <ShieldCheck className="w-6 h-6 mb-2 text-emerald-600" />
              <p className="text-sm font-bold text-slate-600">Check-ins Hoje</p>
              <p className="text-3xl font-black text-slate-800 mt-1">24</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <Sparkles className="w-6 h-6 mb-2 text-amber-500" />
              <p className="text-sm font-bold text-slate-600">Limpeza Pendente</p>
              <p className="text-3xl font-black text-slate-800 mt-1">12</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <LayoutGrid className="w-6 h-6 mb-2 text-purple-600" />
              <p className="text-sm font-bold text-slate-600">RevPAR Atual</p>
              <p className="text-3xl font-black text-slate-800 mt-1">R$ 450</p>
            </CardContent>
          </Card>
        </div>
        <FinancialDashboard />
      </div>
    )
  }

  // FRONT OFFICE VIEW
  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Front Office</h1>
        <p className="text-slate-500">Dashboard Operacional e Rotinas de Recepção</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-6 w-full justify-start overflow-x-auto h-auto flex-nowrap">
          <TabsTrigger value="dashboard" className="px-4 py-2">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="checkin" className="px-4 py-2">
            Check-in
          </TabsTrigger>
          <TabsTrigger value="checkout" className="px-4 py-2">
            Check-out
          </TabsTrigger>
          <TabsTrigger value="rotinas" className="px-4 py-2">
            Rotinas
          </TabsTrigger>
          <TabsTrigger value="kpis" className="px-4 py-2">
            KPIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="outline-none mt-0">
          <FrontOfficeMain onNavigate={setActiveTab} />
        </TabsContent>
        <TabsContent value="checkin" className="outline-none mt-0">
          <CheckIn />
        </TabsContent>
        <TabsContent value="checkout" className="outline-none mt-0">
          <CheckOut />
        </TabsContent>
        <TabsContent value="rotinas" className="outline-none mt-0">
          <ShiftRoutines />
        </TabsContent>
        <TabsContent value="kpis" className="outline-none mt-0">
          <FrontOfficeKPIs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
