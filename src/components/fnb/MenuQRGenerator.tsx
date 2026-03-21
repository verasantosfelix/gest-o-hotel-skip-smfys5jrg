import { Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function MenuQRGenerator() {
  const publicUrl = `${window.location.origin}/menu`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}&margin=10`

  return (
    <Card className="border-slate-200 shadow-sm max-w-2xl mx-auto">
      <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">QR Code do Menu Digital</h2>
          <p className="text-slate-500">
            Imprima este QR Code e coloque nas mesas ou displays do restaurante.
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <img src={qrUrl} alt="Menu QR Code" className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg" />
        </div>

        <div className="bg-slate-50 p-3 rounded-md border border-slate-200 w-full max-w-md break-all">
          <span className="text-xs font-mono text-slate-600">{publicUrl}</span>
        </div>

        <div className="flex gap-4">
          <Button asChild className="gap-2" size="lg">
            <a href={qrUrl} download="menu_qrcode.png" target="_blank" rel="noreferrer">
              <Download className="w-4 h-4" /> Baixar Imagem (PNG)
            </a>
          </Button>
          <Button variant="outline" asChild className="gap-2" size="lg">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              Acessar Link Público
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
