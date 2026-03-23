import { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getSpaServices, SpaService, deleteSpaService } from '@/services/spa'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import useAuthStore from '@/stores/useAuthStore'

export default function SpaCatalog() {
  const { hasAccess, canWrite } = useAccess()
  const [services, setServices] = useState<SpaService[]>([])

  const loadData = async () => {
    try {
      setServices(await getSpaServices())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (!hasAccess([], 'Catálogo de Serviços')) {
    return <RestrictedAccess />
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir serviço?')) return
    try {
      await deleteSpaService(id)
      toast({ title: 'Serviço excluído' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg shadow-sm border border-indigo-200">
            <BookOpen className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Catálogo de Serviços
            </h1>
            <p className="text-sm text-slate-500">Serviços e Tratamentos do SPA</p>
          </div>
        </div>
        {canWrite('Catálogo de Serviços') && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Novo Serviço
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <Card key={s.id} className="overflow-hidden">
            <CardContent className="p-0">
              {s.image ? (
                <img src={s.image} alt={s.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-10 h-10 opacity-20" />
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{s.name}</h3>
                    <p className="text-sm text-slate-500">{s.category}</p>
                  </div>
                  <Badge variant={s.status === 'published' ? 'default' : 'secondary'}>
                    {s.status}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm font-medium text-slate-700">
                  <span>{s.duration_minutes} min</span>
                  <span>•</span>
                  <span>{formatCurrency(s.price)}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {s.description || 'Sem descrição detalhada.'}
                </p>

                {canWrite('Catálogo de Serviços') && (
                  <div className="flex gap-2 pt-2 border-t mt-4">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {services.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            Nenhum serviço cadastrado.
          </div>
        )}
      </div>
    </div>
  )
}
