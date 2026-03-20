import React, { useEffect } from 'react'

const originalConsoleError = console.error
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Invalid prop') &&
    (args[0].includes('React.Fragment') || args[0].includes('Fragment')) &&
    args.some(
      (arg: any) =>
        typeof arg === 'string' && (arg.includes('data-uid') || arg.includes('data-prohibitions')),
    )
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

import * as jsxRuntime from 'react/jsx-runtime'
import * as jsxDevRuntime from 'react/jsx-dev-runtime'

try {
  const patch = (rt: any) => {
    if (!rt) return
    const methods = ['jsx', 'jsxs', 'jsxDEV']
    methods.forEach((m) => {
      if (typeof rt[m] === 'function') {
        const orig = rt[m]
        try {
          rt[m] = function (t: any, p: any, ...args: any[]) {
            const isFragment =
              t === React.Fragment ||
              t === Symbol.for('react.fragment') ||
              (typeof t === 'symbol' && t.toString().includes('react.fragment'))
            if (isFragment && p && ('data-uid' in p || 'data-prohibitions' in p)) {
              const { 'data-uid': _, 'data-prohibitions': __, ...rest } = p
              return orig(t, rest, ...args)
            }
            return orig(t, p, ...args)
          }
        } catch (e) {
          // Silent fallback for frozen properties
        }
      }
    })
  }

  patch(jsxRuntime)
  patch(jsxDevRuntime)

  // Vite pre-bundles dependencies as CJS, so the actual mutable exports are often on the default object
  if ('default' in jsxRuntime) patch((jsxRuntime as any).default)
  if ('default' in jsxDevRuntime) patch((jsxDevRuntime as any).default)
} catch (e) {
  // Silent fallback if module is completely sealed
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import pb from '@/lib/pocketbase/client'

import Index from './pages/Index'
import Reservations from './pages/Reservations'
import Rooms from './pages/Rooms'
import Guests from './pages/Guests'
import Housekeeping from './pages/Housekeeping'
import NotFound from './pages/NotFound'
import GuestPortal from './pages/GuestPortal'
import Layout from './components/Layout'
import ServiceGuestLookup from './pages/ServiceGuestLookup'
import ServiceExpensePosting from './pages/ServiceExpensePosting'
import Audit from './pages/Audit'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import CRM from './pages/CRM'
import Staff from './pages/Staff'
import Integrations from './pages/Integrations'
import Marketing from './pages/Marketing'
import FnB from './pages/FnB'
import Events from './pages/Events'
import Reports from './pages/Reports'
import Maintenance from './pages/Maintenance'
import Security from './pages/Security'
import Revenue from './pages/Revenue'
import TechMobility from './pages/TechMobility'
import AIGovernance from './pages/AIGovernance'
import GuestJourney from './pages/GuestJourney'
import Communication from './pages/Communication'
import DocumentsContracts from './pages/DocumentsContracts'
import AdvancedConcierge from './pages/AdvancedConcierge'
import MICE from './pages/MICE'
import FleetTransfers from './pages/FleetTransfers'
import SpaWellness from './pages/SpaWellness'
import PoolsLeisure from './pages/PoolsLeisure'
import GiftShop from './pages/GiftShop'
import ChatOps from './pages/ChatOps'
import Payments from './pages/Payments'
import Laundry from './pages/Laundry'
import LostAndFound from './pages/LostAndFound'
import MinibarAmenities from './pages/MinibarAmenities'
import LoyaltyFeedback from './pages/LoyaltyFeedback'
import GuestComms from './pages/GuestComms'
import AIConcierge from './pages/AIConcierge'
import FinanceCorporate from './pages/FinanceCorporate'
import NightAudit from './pages/NightAudit'

import HRIntelligence from './pages/HRIntelligence'
import ITAdmin from './pages/ITAdmin'
import FBOps from './pages/FBOps'
import SalesCRM from './pages/SalesCRM'

import { HotelProvider } from './stores/useHotelStore'
import { ReservationProvider } from './stores/useReservationStore'
import { InventoryProvider } from './stores/useInventoryStore'
import { AuditProvider } from './stores/useAuditStore'
import { AuthProvider } from './stores/useAuthStore'
import { RoomProvider } from './stores/useRoomStore'
import { ApprovalProvider } from './stores/useApprovalStore'

const App = () => {
  useEffect(() => {
    if (!pb.authStore.isValid) {
      pb.collection('users')
        .authWithPassword('verasantos.cql@gmail.com', 'securepassword123')
        .catch(console.error)
    }
  }, [])

  return (
    <AuthProvider>
      <AuditProvider>
        <ApprovalProvider>
          <InventoryProvider>
            <HotelProvider>
              <ReservationProvider>
                <RoomProvider>
                  <BrowserRouter
                    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
                  >
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <Routes>
                        <Route element={<Layout />}>
                          <Route path="/" element={<Index />} />
                          <Route path="/reservas" element={<Reservations />} />
                          <Route path="/quartos" element={<Rooms />} />
                          <Route path="/hospedes" element={<Guests />} />
                          <Route path="/governanca" element={<Housekeeping />} />
                          <Route path="/busca-hospedes" element={<ServiceGuestLookup />} />
                          <Route path="/lancamento-servicos" element={<ServiceExpensePosting />} />
                          <Route path="/auditoria" element={<Audit />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/relatorios" element={<Reports />} />
                          <Route path="/configuracoes" element={<Settings />} />
                          <Route path="/crm" element={<CRM />} />
                          <Route path="/equipe" element={<Staff />} />
                          <Route path="/integracoes" element={<Integrations />} />
                          <Route path="/marketing" element={<Marketing />} />
                          <Route path="/fnb" element={<FnB />} />
                          <Route path="/eventos" element={<Events />} />
                          <Route path="/manutencao" element={<Maintenance />} />
                          <Route path="/seguranca" element={<Security />} />
                          <Route path="/revenue" element={<Revenue />} />
                          <Route path="/mobilidade" element={<TechMobility />} />
                          <Route path="/ia-governanca" element={<AIGovernance />} />
                          <Route path="/guest-journey" element={<GuestJourney />} />
                          <Route path="/comunicacao" element={<Communication />} />
                          <Route path="/documentos-contratos" element={<DocumentsContracts />} />
                          <Route path="/concierge" element={<AdvancedConcierge />} />
                          <Route path="/mice" element={<MICE />} />
                          <Route path="/frota" element={<FleetTransfers />} />
                          <Route path="/spa" element={<SpaWellness />} />
                          <Route path="/lazer" element={<PoolsLeisure />} />
                          <Route path="/loja" element={<GiftShop />} />
                          <Route path="/chatops" element={<ChatOps />} />
                          <Route path="/pagamentos" element={<Payments />} />

                          <Route path="/lavanderia" element={<Laundry />} />
                          <Route path="/achados-perdidos" element={<LostAndFound />} />
                          <Route path="/minibar-amenities" element={<MinibarAmenities />} />
                          <Route path="/fidelidade-feedback" element={<LoyaltyFeedback />} />
                          <Route path="/guest-comms" element={<GuestComms />} />
                          <Route path="/ai-concierge" element={<AIConcierge />} />
                          <Route path="/financeiro-corp" element={<FinanceCorporate />} />
                          <Route path="/auditoria-noturna" element={<NightAudit />} />

                          <Route path="/hr" element={<HRIntelligence />} />
                          <Route path="/it-admin" element={<ITAdmin />} />
                          <Route path="/fb-ops" element={<FBOps />} />
                          <Route path="/sales-crm" element={<SalesCRM />} />
                        </Route>
                        <Route path="/portal/guest/:reserva_id" element={<GuestPortal />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </TooltipProvider>
                  </BrowserRouter>
                </RoomProvider>
              </ReservationProvider>
            </HotelProvider>
          </InventoryProvider>
        </ApprovalProvider>
      </AuditProvider>
    </AuthProvider>
  )
}

export default App
