import { useState } from 'react'
import { BookOpen, Utensils, Tag, QrCode, ClipboardCheck } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import useAuthStore from '@/stores/useAuthStore'

import { MenuCategoriesManager } from '@/components/fnb/MenuCategoriesManager'
import { MenuItemsManager } from '@/components/fnb/MenuItemsManager'
import { MenuPublishManager } from '@/components/fnb/MenuPublishManager'
import { MenuQRGenerator } from '@/components/fnb/MenuQRGenerator'

export default function DigitalMenuAdmin() {
  const { hasAccess } = useAccess()
  const { userRole } = useAuthStore()

  const isDirector = hasAccess(['Direcao_Admin'])
  const isFrontDesk = userRole === 'Front_Desk'

  if (!hasAccess(['Restaurante_Bar', 'Direcao_Admin', 'Front_Desk'], 'Menu Digital')) {
    return <RestrictedAccess requiredRoles={['Restaurante_Bar', 'Direcao_Admin', 'Front_Desk']} />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-lg shadow-sm border border-orange-200">
          <BookOpen className="w-6 h-6 text-orange-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Gestão do Menu Digital
          </h1>
          <p className="text-sm text-slate-500">
            Controle de categorias, pratos, disponibilidade e publicação
          </p>
        </div>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="mb-6 h-auto bg-slate-100 flex flex-wrap justify-start border border-slate-200 shadow-sm p-1 rounded-md">
          <TabsTrigger value="items" className="px-4 py-2 font-medium gap-2">
            <Utensils className="w-4 h-4" /> Itens do Menu
          </TabsTrigger>
          {!isFrontDesk && (
            <TabsTrigger value="categories" className="px-4 py-2 font-medium gap-2">
              <Tag className="w-4 h-4" /> Categorias
            </TabsTrigger>
          )}
          {isDirector && (
            <TabsTrigger
              value="publish"
              className="px-4 py-2 font-medium gap-2 text-indigo-600 data-[state=active]:text-indigo-700"
            >
              <ClipboardCheck className="w-4 h-4" /> Aprovações
            </TabsTrigger>
          )}
          <TabsTrigger value="qr" className="px-4 py-2 font-medium gap-2">
            <QrCode className="w-4 h-4" /> Gerar QR Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-0 outline-none">
          <MenuItemsManager />
        </TabsContent>
        {!isFrontDesk && (
          <TabsContent value="categories" className="mt-0 outline-none">
            <MenuCategoriesManager />
          </TabsContent>
        )}
        {isDirector && (
          <TabsContent value="publish" className="mt-0 outline-none">
            <MenuPublishManager />
          </TabsContent>
        )}
        <TabsContent value="qr" className="mt-0 outline-none">
          <MenuQRGenerator />
        </TabsContent>
      </Tabs>
    </div>
  )
}
