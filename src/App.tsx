import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Reservations from './pages/Reservations'
import Rooms from './pages/Rooms'
import Guests from './pages/Guests'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { HotelProvider } from './stores/useHotelStore'

const App = () => (
  <HotelProvider>
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
            {/* Placeholder routes for completeness of sidebar */}
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
  </HotelProvider>
)

export default App
