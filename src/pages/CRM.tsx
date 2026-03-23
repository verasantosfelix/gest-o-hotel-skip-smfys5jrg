import { useState, useEffect } from 'react'
import { HeartHandshake, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { GuestLoyalty, getLoyalty } from '@/services/guest_loyalty'
import { GuestProfileView } from '@/components/crm/GuestProfileView'

export default function CRM() {
  const { hasAccess } = useAccess()
  const [guests, setGuests] = useState<GuestLoyalty[]>([])
  const [search, setSearch] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<GuestLoyalty | null>(null)

  useEffect(() => {
    getLoyalty().then(setGuests).catch(console.error)
  }, [selectedGuest])

  if (!hasAccess(['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'], 'CRM')) {
    return (
      <RestrictedAccess requiredRoles={['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk']} />
    )
  }

  if (selectedGuest) {
    return <GuestProfileView guest={selectedGuest} onBack={() => setSelectedGuest(null)} />
  }

  const filtered = guests.filter((g) => g.guest_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <HeartHandshake className="text-blue-600" /> CRM & Gestão de Hóspedes
      </h1>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar hóspede por nome..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedGuest(g)}
                className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-700">
                    {g.guest_name}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {g.tier || 'Standard'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4">{g.email || 'Sem email'}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-600 font-medium">{g.points || 0} pts</span>
                  {g.marketing_consent && <span className="text-emerald-600">✔ GDPR OK</span>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-500">
                Nenhum hóspede encontrado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
