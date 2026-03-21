import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getFBProducts, FBProduct } from '@/services/fnb'
import { logAuditAction } from '@/services/audit'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'
import pb from '@/lib/pocketbase/client'

export function MenuPublishManager() {
  const [drafts, setDrafts] = useState<FBProduct[]>([])

  const loadData = async () => {
    try {
      const all = await getFBProducts("status = 'draft'")
      setDrafts(all)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_products', loadData)

  const handleApprove = async (p: FBProduct) => {
    try {
      await pb.collection('fb_products').update(p.id, { status: 'published' })
      logAuditAction('APPROVE_MENU_ITEM', 'Menu Digital', { item: p.name })
      toast({ title: 'Item publicado no menu público' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao aprovar', variant: 'destructive' })
    }
  }

  const handlePublishAll = async () => {
    if (!window.confirm(`Publicar todos os ${drafts.length} itens pendentes?`)) return
    try {
      await Promise.all(
        drafts.map((d) => pb.collection('fb_products').update(d.id, { status: 'published' })),
      )
      logAuditAction('APPROVE_ALL_MENU_ITEMS', 'Menu Digital', { count: drafts.length })
      toast({ title: 'Todos os itens foram publicados' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro na publicação em massa', variant: 'destructive' })
    }
  }

  return (
    <Card className="border-indigo-200 shadow-sm">
      <CardHeader className="bg-indigo-50/50 border-b flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg text-indigo-900">
            Itens Pendentes de Publicação ({drafts.length})
          </CardTitle>
          <p className="text-sm text-indigo-700/70 mt-1">
            Esses itens foram criados ou editados e aguardam aprovação.
          </p>
        </div>
        {drafts.length > 0 && (
          <Button
            onClick={handlePublishAll}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar Todos
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {drafts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Nome do Prato</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right pr-6">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.map((d) => (
                <TableRow key={d.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 font-medium text-slate-800">{d.name}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {d.expand?.category_id?.name || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-slate-700">{d.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(d)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                    >
                      Publicar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3 opacity-50" />
            <p className="text-slate-600 font-medium">Tudo atualizado!</p>
            <p className="text-sm text-slate-400">Não há alterações pendentes de revisão.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
