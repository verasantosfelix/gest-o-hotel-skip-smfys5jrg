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
import Layout from './components/Layout'
import { HotelProvider } from './stores/useHotelStore'
import { ReservationProvider } from './stores/useReservationStore'

const App = () => (
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
              <Route
                path="/auditoria"
                element={<div className="p-4">Módulo de Rastreabilidade (Em desenvolvimento)</div>}
              />
              <Route
                path="/configuracoes"
                element={<div className="p-4">Configurações do Sistema (Em desenvolvimento)</div>}
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </ReservationProvider>
  </HotelProvider>
)

export default App
