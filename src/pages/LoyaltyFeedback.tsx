import { useState, useEffect } from 'react'
import { Star, MessageSquareHeart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getLoyalty, createLoyalty } from '@/services/guest_loyalty'
import { getFeedback, createFeedback } from '@/services/feedback'
import { toast } from '@/components/ui/use-toast'

export default function LoyaltyFeedback() {
  const [loyalty, setLoyalty] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [lForm, setLForm] = useState({ name: '', points: '0', tier: 'Silver' })
  const [fForm, setFForm] = useState({ name: '', rating: '5', comments: '' })

  const loadData = async () => {
    try {
      setLoyalty(await getLoyalty())
      setFeedbacks(await getFeedback())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleLoyalty = async () => {
    try {
      await createLoyalty({
        guest_name: lForm.name,
        points: parseInt(lForm.points),
        tier: lForm.tier,
      })
      toast({ title: 'Sucesso', description: 'Hóspede adicionado ao programa.' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleFeedback = async () => {
    const text = fForm.comments.toLowerCase()
    let polarity = 'Neutral'
    if (text.match(/bom|excelente|ótimo|otimo|amei|maravilhoso/)) polarity = 'Positive'
    if (text.match(/ruim|péssimo|pessimo|horrível|horrivel|odeio/)) polarity = 'Negative'
    try {
      await createFeedback({
        guest_name: fForm.name,
        rating: parseInt(fForm.rating),
        comments: fForm.comments,
        polarity,
      })
      toast({ title: 'Sucesso', description: 'Feedback computado com NLP.' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-primary" /> Fidelidade & Feedback
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie tiers VIP e analise o sentimento dos reviews.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Programa de Fidelidade</CardTitle>
            <CardDescription>Classificação de hóspedes (Tiers).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome"
                value={lForm.name}
                onChange={(e) => setLForm({ ...lForm, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Pts"
                className="w-24"
                value={lForm.points}
                onChange={(e) => setLForm({ ...lForm, points: e.target.value })}
              />
              <select
                className="border rounded px-2"
                value={lForm.tier}
                onChange={(e) => setLForm({ ...lForm, tier: e.target.value })}
              >
                <option>Silver</option>
                <option>Gold</option>
                <option>Diamond</option>
              </select>
              <Button onClick={handleLoyalty}>Add</Button>
            </div>
            <div className="space-y-2 mt-4">
              {loyalty.map((l) => (
                <div key={l.id} className="flex justify-between border-b pb-2 text-sm">
                  <span>
                    {l.guest_name} ({l.points} pts)
                  </span>
                  <span className="font-bold">{l.tier}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareHeart className="w-5 h-5" /> Feedback Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Nome"
                value={fForm.name}
                onChange={(e) => setFForm({ ...fForm, name: e.target.value })}
              />
              <Input
                placeholder="Comentário do hóspede"
                value={fForm.comments}
                onChange={(e) => setFForm({ ...fForm, comments: e.target.value })}
              />
              <Button onClick={handleFeedback} className="w-full">
                Registrar & Analisar
              </Button>
            </div>
            <div className="space-y-2 mt-4">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  className="p-3 border rounded bg-slate-50 text-sm flex flex-col gap-1"
                >
                  <div className="flex justify-between font-bold">
                    <span>{f.guest_name}</span>{' '}
                    <span
                      className={
                        f.polarity === 'Positive'
                          ? 'text-emerald-600'
                          : f.polarity === 'Negative'
                            ? 'text-rose-600'
                            : 'text-slate-500'
                      }
                    >
                      {f.polarity}
                    </span>
                  </div>
                  <p className="italic text-slate-600">"{f.comments}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
