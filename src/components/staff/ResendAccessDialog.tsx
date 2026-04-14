import { useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { resendAccessEmail } from '@/services/staff'

export function ResendAccessDialog({ user, trigger }: { user: any; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    setIsLoading(true)
    try {
      await resendAccessEmail(user.id)
      toast({
        title: 'Sucesso',
        description: `E-mail de acesso enviado com sucesso para ${user.email}`,
      })
      setOpen(false)
    } catch (error: any) {
      if (error?.response?.message === 'smtp_error' || error?.message === 'smtp_error') {
        toast({
          title: 'Erro',
          description:
            'Erro ao enviar e-mail. Por favor, verifique as configurações de SMTP no painel de Integração.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao enviar instruções de acesso.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            title="Enviar E-mail de Acesso"
          >
            <Mail className="w-4 h-4 text-slate-500" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirmar Envio</DialogTitle>
          <DialogDescription>
            Deseja enviar as instruções de acesso para <strong>{user.name || user.email}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Enviar E-mail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
