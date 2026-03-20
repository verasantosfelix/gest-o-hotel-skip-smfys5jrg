import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Edit2, Loader2, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'
import { updateUser } from '@/services/staff'
import pb from '@/lib/pocketbase/client'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
})

type FormValues = z.infer<typeof formSchema>

export function EditUserDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({ name: user.name || '' })
      setAvatarFile(null)
      if (user.avatar) {
        setAvatarPreview(pb.files.getUrl(user, user.avatar))
      } else {
        setAvatarPreview(null)
      }
    }
  }, [open, user, form])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: 'Erro',
        description: 'Formato não suportado. Use JPG ou PNG.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Erro',
        description: 'O arquivo excede o limite de 2MB.',
        variant: 'destructive',
      })
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const clearFile = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      await updateUser(user.id, { name: values.name }, avatarFile)
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso.' })
      setOpen(false)
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Falha ao atualizar o perfil.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Editar Perfil">
          <Edit2 className="w-4 h-4 text-slate-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize as informações e a foto de perfil do membro.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <Avatar className="w-20 h-20 border-2 border-slate-100 shadow-sm">
            <AvatarImage src={avatarPreview || undefined} className="object-cover" />
            <AvatarFallback className="text-xl text-slate-500 bg-slate-100">
              {form.watch('name') ? form.watch('name').substring(0, 2).toUpperCase() : 'UP'}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Alterar Foto
            </Button>
            {avatarPreview && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Email (Apenas leitura)</FormLabel>
              <Input value={user.email} disabled className="bg-slate-50 text-slate-500" />
            </div>

            <div className="flex justify-end pt-4 pb-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
