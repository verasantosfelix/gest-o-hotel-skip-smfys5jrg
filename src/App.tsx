import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
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
import { HotelProvider } from './stores/useHotelStore'
import { ReservationProvider } from './stores/useReservationStore'
import { InventoryProvider } from './stores/useInventoryStore'
import { AuditProvider } from './stores/useAuditStore'
import { AuthProvider } from './stores/useAuthStore'
import { RoomProvider } from './stores/useRoomStore'
import { ApprovalProvider } from './stores/useApprovalStore'

const App = () => (
  <AuthProvider>
    <AuditProvider>
      <ApprovalProvider>
        <InventoryProvider>
          <HotelProvider>
            <ReservationProvider>
              <RoomProvider>
                <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
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

export default App
