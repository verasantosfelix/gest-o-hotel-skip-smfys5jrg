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
import Settings from './pages/Settings'
import { HotelProvider } from './stores/useHotelStore'
import { ReservationProvider } from './stores/useReservationStore'
import { InventoryProvider } from './stores/useInventoryStore'
import { AuditProvider } from './stores/useAuditStore'
import { AuthProvider } from './stores/useAuthStore'

const App = () => (
  <AuthProvider>
    <AuditProvider>
      <InventoryProvider>
        <HotelProvider>
          <ReservationProvider>
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
                    <Route path="/configuracoes" element={<Settings />} />
                  </Route>
                  {/* Guest-facing routes */}
                  <Route path="/portal/guest/:reserva_id" element={<GuestPortal />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </BrowserRouter>
          </ReservationProvider>
        </HotelProvider>
      </InventoryProvider>
    </AuditProvider>
  </AuthProvider>
)

export default App
