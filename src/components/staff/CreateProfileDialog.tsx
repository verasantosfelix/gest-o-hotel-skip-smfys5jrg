import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Loader2 } from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/use-toast'
import { createProfile } from '@/services/staff'

const ALL_MODULES = [
  'Dashboard',
  'Reservas',
  'Hóspedes',
  'Quartos',
  'Governança',
  'Lançamentos Rápidos',
  'Busca Hóspedes',
  'Agenda Diária',
  'Agenda Mensal',
  'Catálogo de Serviços',
  'Operações & Salas',
  'Lavanderia SPA',
  'Lazer & Piscinas',
  'Lavanderia Geral',
  'Achados e Perdidos',
  'Amenities',
  'F&B Básico',
  'F&B Operações',
  'Menu Digital',
  'Menu Impresso (PDF)',
  'Loja',
  'Manutenção',
  'Alçadas (Aprovações)',
  'Analytics',
  'Relatórios',
  'Revenue Mgmt',
  'Vendas & Distribuição',
  'Financeiro Corp',
  'Auditoria Noturna',
  'Pagamentos',
  'Equipe & RH',
  'HR Intelligence',
  'Documentos',
  'Auditoria',
  'CRM',
  'Fidelidade',
  'Marketing',
  'Eventos & MICE',
  'Grupos (MICE)',
  'Concierge',
  'IA Concierge',
  'Guest Journey',
  'Omnichannel',
  'Comms Automáticas',
  'Frota',
  'IT Admin',
  'Integrações',
  'ChatOps',
  'Governança IA',
  'Mobilidade',
  'Segurança',
  'Configurações',
]

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  role_level: z.string().min(1, 'Selecione o nível de acesso'),
  allowed_actions: z.array(z.string()),
})

type FormValues = z.infer<typeof formSchema>

export function CreateProfileDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      role_level: '',
      allowed_actions: [],
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      const isGlobal = ['Gerente_Geral', 'Director_Geral', 'Administrativo_Geral'].includes(
        values.role_level,
      )
      await createProfile({
        name: values.name,
        role_level: values.role_level,
        allowed_actions: isGlobal ? ['*'] : values.allowed_actions,
      })
      toast({ title: 'Sucesso', description: 'Cargo criado com sucesso.' })
      setOpen(false)
      form.reset()
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Falha ao criar o cargo.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const roleLevel = form.watch('role_level')
  const isGlobal = ['Gerente_Geral', 'Director_Geral', 'Administrativo_Geral'].includes(roleLevel)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm">
          <Plus className="w-4 h-4" /> Novo Cargo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Cargo</DialogTitle>
          <DialogDescription>
            Defina o nome do perfil, nível hierárquico e módulos permitidos.
          </DialogDescription>
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
                    <Input placeholder="Ex: Supervisor de F&B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Acesso (RBAC)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a hierarquia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Gerente_Geral">Gerente Geral (Acesso Total)</SelectItem>
                      <SelectItem value="Director_Geral">
                        Director Geral (Somente Leitura)
                      </SelectItem>
                      <SelectItem value="Administrativo_Geral">
                        Administrativo Geral (Operacional Total)
                      </SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Gerente_Area">Gerente de Área</SelectItem>
                      <SelectItem value="Responsavel_Equipa">Responsável de Equipa</SelectItem>
                      <SelectItem value="Atendente">Atendente / Empregado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isGlobal && roleLevel && (
              <FormField
                control={form.control}
                name="allowed_actions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Módulos Permitidos</FormLabel>
                      <FormDescription>
                        Selecione os módulos que este cargo pode acessar.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                      {ALL_MODULES.map((module) => (
                        <FormField
                          key={module}
                          control={form.control}
                          name="allowed_actions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={module}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(module)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, module])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== module),
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">{module}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Cargo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
