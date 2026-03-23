import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  LogOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

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
  const { profile, loadingProfile, profileError, errorDetails, retryLoadProfile, logout } =
    useAuthStore()
  const { effectiveRoleLevel, effectiveAllowedActions } = useAccess()
  const { selectedHotel } = useHotelStore()
  const [activeTab, setActiveTab] = useState('dashboard')

  const [loadingSeconds, setLoadingSeconds] = useState(0)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loadingProfile) {
      interval = setInterval(() => {
        setLoadingSeconds((s) => s + 1)
      }, 1000)
    } else {
      setLoadingSeconds(0)
    }
    return () => clearInterval(interval)
  }, [loadingProfile])

  useRealtime('users', (e) => {
    if (e.record.id === pb.authStore.record?.id) {
      if (e.action === 'update' && e.record.is_active === false) {
        retryLoadProfile()
      }
    }
  })

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-slate-700 animate-pulse font-medium text-lg">
            Carregando dashboard...
          </p>
          {loadingSeconds >= 5 && (
            <p className="text-amber-600 text-sm animate-fade-in transition-opacity">
              A conexão parece estar lenta. Aguarde mais um momento...
            </p>
          )}
        </div>
      </div>
    )
  }

  if (profileError) {
    const errorConfig = {
      suspended: {
        title: 'Acesso Suspenso',
        desc: 'A sua conta está marcada como inativa. Não tem acesso ao sistema no momento. Por favor, contacte a administração.',
        icon: ShieldAlert,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
      },
      not_found: {
        title: 'Erro de Configuração: Perfil Não Encontrado',
        desc: 'A sua conta não possui um perfil válido associado. Por favor, contacte o administrador para resolver esta questão.',
        icon: UserX,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
      },
      forbidden: {
        title: 'Acesso Negado',
        desc: 'Você não tem permissão para carregar os dados deste perfil. Verifique as suas credenciais com o suporte técnico.',
        icon: AlertCircle,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
      },
      timeout: {
        title: 'Tempo Limite Excedido',
        desc: 'Não foi possível carregar os dados a tempo (10 segundos). Verifique a sua conexão com a internet ou tente novamente.',
        icon: Clock,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
      },
      fetch_error: {
        title: 'Erro de Comunicação',
        desc: 'Ocorreu um erro ao tentar comunicar com os servidores do sistema.',
        icon: AlertCircle,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
      },
    }[profileError] || {
      title: 'Erro Desconhecido',
      desc: 'Ocorreu um problema inesperado ao inicializar a sua sessão.',
      icon: AlertCircle,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
    }

    const Icon = errorConfig.icon

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Card
          className={`max-w-xl w-full ${errorConfig.border} shadow-sm animate-fade-in-up bg-white`}
        >
          <CardContent className="p-8 text-center space-y-5">
            <div
              className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${errorConfig.bg}`}
            >
              <Icon className={`w-10 h-10 ${errorConfig.color}`} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{errorConfig.title}</h2>
            <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
              {errorConfig.desc}
            </p>

            {errorDetails && (
              <Collapsible
                open={showTechnicalDetails}
                onOpenChange={setShowTechnicalDetails}
                className="w-full text-left mt-6 border border-slate-100 rounded-md p-1 bg-slate-50"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex justify-between text-slate-500 hover:text-slate-800"
                  >
                    <span className="font-medium text-xs uppercase tracking-wider">
                      Mostrar Detalhes Técnicos
                    </span>
                    {showTechnicalDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 px-1 pb-1">
                  <Alert
                    variant="destructive"
                    className="bg-slate-900 text-slate-300 border-0 rounded"
                  >
                    <AlertTitle className="text-slate-50 font-mono text-sm mb-2">
                      Contexto do Erro JSON
                    </AlertTitle>
                    <AlertDescription>
                      <pre className="w-full overflow-x-auto text-xs font-mono text-slate-400">
                        {JSON.stringify(errorDetails, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={retryLoadProfile}
                className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm h-11 px-6"
              >
                <RefreshCw className="w-4 h-4" /> Tentar Novamente
              </Button>
              <Button
                onClick={() => {
                  logout()
                  window.location.reload()
                }}
                variant="outline"
                className="gap-2 h-11 px-6 border-slate-300 text-slate-700"
              >
                <LogOut className="w-4 h-4" /> Limpar Cache e Sair
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
