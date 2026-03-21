import { useState, useEffect } from 'react'
import { getSpaServices, SpaService } from '@/services/spa'
import { formatCurrency } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import { Heart, Clock, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const DICT = {
  PT: { unav: 'Indisponível', lang: 'Idioma', noDesc: 'Sem descrição', duration: 'minutos' },
  EN: { unav: 'Unavailable', lang: 'Language', noDesc: 'No description', duration: 'minutes' },
  ES: { unav: 'Agotado', lang: 'Idioma', noDesc: 'Sin descripción', duration: 'minutos' },
  FR: { unav: 'Indisponible', lang: 'Langue', noDesc: 'Pas de description', duration: 'minutes' },
}

export default function SpaPublicMenu() {
  const [services, setServices] = useState<SpaService[]>([])
  const [lang, setLang] = useState<'PT' | 'EN' | 'ES' | 'FR'>('PT')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSpaServices("status = 'published'")
        setServices(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const t = DICT[lang]

  // Group by category
  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)))

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans text-slate-800 pb-20 selection:bg-rose-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-rose-900 tracking-tight">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
            SKIP Wellness & Spa
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            {['PT', 'EN', 'ES', 'FR'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l as any)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${lang === l ? 'bg-rose-900 text-white shadow-md' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-12 space-y-16">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
          </div>
        )}

        {!loading &&
          categories.map((cat) => {
            const items = services.filter((s) => s.category === cat)
            if (items.length === 0) return null

            return (
              <section key={cat} className="animate-fade-in-up">
                <h2 className="text-3xl font-serif italic text-slate-900 border-b border-rose-200 pb-3 mb-8 tracking-tight flex items-center gap-3">
                  <span className="w-2 h-2 bg-rose-400 rounded-full inline-block"></span>
                  {cat}
                </h2>
                <div className="grid sm:grid-cols-2 gap-8">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-col gap-4 group ${!item.available ? 'opacity-60 grayscale' : ''}`}
                    >
                      {item.image && (
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-rose-50 shadow-sm">
                          <img
                            src={pb.files.getUrl(item, item.image, { thumb: '600x450' })}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            alt={item.name}
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex flex-col px-1">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h3 className="font-bold text-xl text-slate-900 leading-tight">
                            {item.name}
                          </h3>
                          <span className="font-medium text-rose-700 whitespace-nowrap">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
                          {item.description || t.noDesc}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {item.duration_minutes} {t.duration}
                          </span>
                          {!item.available && (
                            <Badge variant="secondary" className="bg-slate-200 text-[10px]">
                              {t.unav}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        {!loading && services.length === 0 && (
          <div className="text-center py-20 text-slate-400 font-serif italic">
            Menu indisponível no momento.
          </div>
        )}
      </main>
    </div>
  )
}
