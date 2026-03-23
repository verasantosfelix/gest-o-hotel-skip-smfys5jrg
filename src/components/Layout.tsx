import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { AppFooter } from './AppFooter'
import useAuthStore from '@/stores/useAuthStore'
import { AlertTriangle } from 'lucide-react'

export default function Layout() {
  const { previewRole, previewSector, setPreviewRole, setPreviewSector } = useAuthStore()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full relative">
          <AppHeader />
          {previewRole && (
            <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm font-medium flex justify-between items-center z-20 shadow-sm">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  Modo de Simulação: Visualizando como{' '}
                  <strong>{previewRole.replace('_', ' ')}</strong>
                  {previewSector &&
                    ['Gerente_Area', 'Responsavel_Equipa', 'Atendente'].includes(previewRole) && (
                      <span>
                        {' '}
                        no setor <strong>{previewSector.replace('_', ' ')}</strong>
                      </span>
                    )}
                  . A interface foi adaptada para este nível de acesso.
                </span>
              </span>
              <button
                onClick={() => {
                  setPreviewRole(null)
                  setPreviewSector(null)
                }}
                className="text-amber-900 hover:text-amber-950 underline text-xs font-bold"
              >
                Sair da Simulação
              </button>
            </div>
          )}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full max-w-7xl mx-auto">
            <Outlet />
          </main>
          <AppFooter />
        </div>
      </div>
    </SidebarProvider>
  )
}
