import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Edit2, Loader2 } from 'lucide-react'

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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { updateProfile } from '@/services/staff'

const ALL_MODULES = [
  'housekeeping',
  'maintenance',
  'fnb',
  'finance',
  'it',
  'hr',
  'crm',
  'events',
  'spa',
  'security',
  'reservations',
  'rooms',
  'guests',
]

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  fullAccess: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

export function EditProfileDialog({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const hasFullAccess =
    profile.allowed_actions &&
    Array.isArray(profile.allowed_actions) &&
    profile.allowed_actions.length >= ALL_MODULES.length

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile.name || '',
      fullAccess: hasFullAccess,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: profile.name || '',
        fullAccess: hasFullAccess,
      })
    }
  }, [open, profile, form, hasFullAccess])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      await updateProfile(profile.id, {
        name: values.name,
        allowed_actions: values.fullAccess ? ALL_MODULES : [],
      })
      toast({ title: 'Sucesso', description: 'Cargo atualizado com sucesso.' })
      setOpen(false)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar o cargo.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-blue-600">
          <Edit2 className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cargo</DialogTitle>
          <DialogDescription>Modifique o nome e as permissões associadas.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cargo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Acesso Total (Admin)</FormLabel>
                    <FormDescription>
                      Concede acesso a todos os módulos e ações do sistema.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
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
