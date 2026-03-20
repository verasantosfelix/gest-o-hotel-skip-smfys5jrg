import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Search, Star, Gift, AlertCircle, HeartHandshake } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useAuthStore from '@/stores/useAuthStore'

export default function CRM() {
  const { userRole } = useAuthStore()
  const [search, setSearch] = useState('')
  const [searched, setSearched] = useState(false)

  if (userRole !== 'Admin' && userRole !== 'Administrativa') {
    return <Navigate to="/" replace />
  }

  const notFound = searched && search.toLowerCase().includes('erro')

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-primary" />
          CRM & Experiência do Hóspede
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie perfis, preferências e programa de fidelidade.
        </p>
      </div>

      <div className="flex gap-2 w-full max-w-md">
        <Input
          placeholder="Buscar hóspede por nome ou ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setSearched(true)}>
          <Search className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </div>

      {notFound && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-md border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">Hóspede não localizado. Confirme o nome ou ID.</p>
        </div>
      )}

      {!notFound && searched && search && (
        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="mb-4 bg-slate-100 p-1">
            <TabsTrigger value="perfil">Perfil e Preferências</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
            <TabsTrigger value="fidelidade">Fidelidade</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Perfil do Hóspede: {search}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-slate-800">Notas Específicas</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-md border border-slate-200">
                    Alérgico a amendoim. Prefere andar alto, longe de elevadores. Solicita
                    travesseiros extras.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Estadias</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between border-b pb-3">
                    <span className="text-slate-700">15/03/2024 - 18/03/2024 (Quarto 302)</span>
                    <span className="font-bold text-slate-900">Consumo: R$ 450,00</span>
                  </li>
                  <li className="flex justify-between border-b pb-3">
                    <span className="text-slate-700">10/01/2024 - 12/01/2024 (Quarto 204)</span>
                    <span className="font-bold text-slate-900">Consumo: R$ 120,00</span>
                  </li>
                </ul>
                <div className="mt-6 bg-slate-50 p-4 rounded-md border border-slate-200">
                  <h4 className="font-semibold text-sm mb-2 text-slate-800">Feedbacks Coletados</h4>
                  <p className="text-slate-600 italic">
                    "Adorei o atendimento no café da manhã!" - (18/03)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recomendacoes">
            <Card>
              <CardHeader>
                <CardTitle>Motor de Recomendações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-emerald-50 p-4 border border-emerald-200 rounded-md">
                  <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Sugestão de Cross-sell
                  </h4>
                  <p className="text-sm text-emerald-700 mt-2">
                    Com base no histórico (Spa em estadias passadas), ofereça o{' '}
                    <strong>Pacote Relaxante (15% OFF)</strong> para esta estadia.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fidelidade">
            <Card>
              <CardHeader>
                <CardTitle>Status: Gold Member</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="bg-amber-100 p-5 rounded-full border border-amber-200">
                    <Gift className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">12.450 Pontos</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Próximo nível: Platinum (faltam 2.550 pts)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
