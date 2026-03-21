import { useState, useEffect } from 'react'
import { getFBProducts, getFBMenuCategories, FBProduct, FBMenuCategory } from '@/services/fnb'
import { formatCurrency } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import { Utensils, Info, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const DICT = {
  PT: { unav: 'Esgotado', lang: 'Idioma', noDesc: 'Sem descrição' },
  EN: { unav: 'Sold Out', lang: 'Language', noDesc: 'No description' },
  ES: { unav: 'Agotado', lang: 'Idioma', noDesc: 'Sin descripción' },
  FR: { unav: 'Épuisé', lang: 'Langue', noDesc: 'Pas de description' },
}

export default function PublicDigitalMenu() {
  const [categories, setCategories] = useState<FBMenuCategory[]>([])
  const [products, setProducts] = useState<FBProduct[]>([])
  const [lang, setLang] = useState<'PT' | 'EN' | 'ES' | 'FR'>('PT')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, p] = await Promise.all([
          getFBMenuCategories(),
          getFBProducts("status = 'published'"),
        ])
        setCategories(c)
        setProducts(p)
      } catch (e) {
        console.error(e)
      }
    }
    fetchData()
  }, [])

  const t = DICT[lang]

  return (
    <div className="min-h-screen bg-[#faf9f7] font-sans text-slate-800 pb-20 selection:bg-slate-200">
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900 tracking-tight">
            <Utensils className="w-5 h-5 text-slate-700" />
            SKIP Restaurant
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            {['PT', 'EN', 'ES', 'FR'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l as any)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${lang === l ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8 space-y-12">
        {categories.map((cat) => {
          const items = products.filter((p) => p.category_id === cat.id)
          if (items.length === 0) return null

          return (
            <section key={cat.id} className="animate-fade-in-up">
              <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6 tracking-tight uppercase">
                {cat.name}
              </h2>
              <div className="grid gap-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row gap-4 group ${!item.is_available ? 'opacity-60 grayscale' : ''}`}
                  >
                    {item.image && (
                      <div className="w-full sm:w-32 h-40 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-slate-100 shadow-sm border border-slate-200/50">
                        <img
                          src={pb.files.getUrl(item, item.image, { thumb: '300x300' })}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          alt={item.name}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">
                          {item.name}
                        </h3>
                        <span className="font-black text-slate-900 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded-md">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed mb-3">
                        {item.description || t.noDesc}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-auto">
                        {!item.is_available && (
                          <Badge variant="destructive" className="text-[10px] uppercase">
                            {t.unav}
                          </Badge>
                        )}
                        {item.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1"
                          >
                            <Info className="w-3 h-3" /> {tag.replace('_', ' ')}
                          </span>
                        ))}
                        {item.restrictions && (
                          <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> {item.restrictions}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
        {products.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Utensils className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Menu is currently being updated.</p>
          </div>
        )}
      </main>
    </div>
  )
}
