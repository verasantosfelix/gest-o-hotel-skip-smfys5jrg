import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Plus, Trash2, Check, ChevronsUpDown, User, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { toast } from '@/components/ui/use-toast'
import { getRooms, RoomRecord } from '@/services/rooms'
import { getLoyalty, createLoyalty, GuestLoyalty } from '@/services/guest_loyalty'
import { createReservation } from '@/services/reservations'
import pb from '@/lib/pocketbase/client'

const roomSchema = z.object({
  typology: z.string().min(1, 'Obrigatório'),
  roomId: z.string().min(1, 'Obrigatório'),
  guestsCount: z.number().min(1, 'Mínimo 1'),
  rate: z.number().min(0, 'Inválido'),
})

const schema = z
  .object({
    guestType: z.enum(['fisico', 'corporativo']),

    guestName: z.string().optional(),
    guestEmail: z.string().email('Email inválido').optional().or(z.literal('')),
    guestPhone: z.string().optional(),
    guestDocument: z.string().optional(),
    associatedCompany: z.string().optional(),

    companyName: z.string().optional(),
    vatNumber: z.string().optional(),

    checkIn: z.date({ required_error: 'Obrigatório' }),
    checkOut: z.date({ required_error: 'Obrigatório' }),

    rooms: z.array(roomSchema).min(1, 'Adicione pelo menos um quarto'),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Check-out deve ser posterior ao Check-in',
    path: ['checkOut'],
  })
  .refine(
    (data) => {
      if (data.guestType === 'fisico') return !!data.guestName && data.guestName.length >= 2
      return true
    },
    { message: 'Nome obrigatório', path: ['guestName'] },
  )
  .refine(
    (data) => {
      if (data.guestType === 'corporativo')
        return !!data.companyName && data.companyName.length >= 2
      return true
    },
    { message: 'Nome da empresa obrigatório', path: ['companyName'] },
  )

const ROOM_TYPOLOGIES = [
  'Single',
  'Duplo/Casal',
  'Casal',
  'Especial',
  'Quádruplo',
  'Vivenda T1',
  'Vivenda T2',
  'standard',
  'suite',
  'luxo',
]

export function CreateReservationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [roomsList, setRoomsList] = useState<RoomRecord[]>([])
  const [guests, setGuests] = useState<GuestLoyalty[]>([])
  const [overlappingRes, setOverlappingRes] = useState<any[]>([])
  const [companyPopOpen, setCompanyPopOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      guestType: 'fisico',
      rooms: [{ typology: '', roomId: '', guestsCount: 1, rate: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms',
  })

  const guestType = form.watch('guestType')
  const checkIn = form.watch('checkIn')
  const checkOut = form.watch('checkOut')
  const selectedRooms = form.watch('rooms')

  useEffect(() => {
    if (open) {
      getRooms().then(setRoomsList)
      getLoyalty().then(setGuests)
      form.reset({
        guestType: 'fisico',
        rooms: [{ typology: '', roomId: '', guestsCount: 1, rate: 0 }],
      })
      setOverlappingRes([])
    }
  }, [open, form])

  useEffect(() => {
    if (checkIn && checkOut && checkOut > checkIn) {
      const inStr = format(checkIn, 'yyyy-MM-dd')
      const outStr = format(checkOut, 'yyyy-MM-dd')
      pb.collection('reservations')
        .getFullList({
          filter: `status != 'cancelado' && status != 'checked_out' && check_in < "${outStr}" && check_out > "${inStr}"`,
        })
        .then(setOverlappingRes)
        .catch(() => {})
    } else {
      setOverlappingRes([])
    }
  }, [checkIn, checkOut])

  const onSubmit = async (v: z.infer<typeof schema>) => {
    try {
      setIsSubmitting(true)
      let guestId = ''

      if (v.guestType === 'fisico') {
        const existing = guests.find(
          (g) =>
            g.guest_name.toLowerCase() === v.guestName?.toLowerCase() &&
            g.document_id === v.guestDocument,
        )
        if (existing) {
          guestId = existing.id
        } else {
          const newG = await createLoyalty({
            guest_name: v.guestName,
            email: v.guestEmail,
            phone: v.guestPhone,
            document_id: v.guestDocument,
            company_name: v.associatedCompany,
            tier: 'Basic',
          })
          guestId = newG.id
        }
      } else {
        const existing = guests.find(
          (g) => g.company_name?.toLowerCase() === v.companyName?.toLowerCase(),
        )
        if (existing) {
          guestId = existing.id
        } else {
          const newG = await createLoyalty({
            guest_name: v.companyName,
            company_name: v.companyName,
            vat_number: v.vatNumber,
            email: v.guestEmail,
            phone: v.guestPhone,
            tier: 'Corporate',
          })
          guestId = newG.id
        }
      }

      for (const r of v.rooms) {
        await createReservation({
          guest_name: v.guestType === 'fisico' ? v.guestName : v.companyName,
          guest_id: guestId,
          room_id: r.roomId,
          check_in: format(v.checkIn, 'yyyy-MM-dd'),
          check_out: format(v.checkOut, 'yyyy-MM-dd'),
          status: 'previsto',
          is_corporate: v.guestType === 'corporativo',
          balance: r.rate,
          total_value: r.rate,
          guests_count: r.guestsCount,
        })
      }

      toast({ title: 'Sucesso', description: 'Reserva(s) criada(s) com sucesso!' })
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro', description: 'Erro ao criar reserva.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAvailableRooms = (typology: string) => {
    return roomsList.filter((r) => {
      if (r.status === 'maintenance' || r.status === 'out_of_order') return false
      if (typology && r.room_type !== typology) return false

      const isOverlapping = overlappingRes.some((ov) => ov.room_id === r.id)
      if (isOverlapping) return false

      const isSelected = selectedRooms.some((sr) => sr.roomId === r.id)
      if (isSelected) return false

      return true
    })
  }

  const corporateGuests = guests.filter((g) => g.company_name)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova Reserva Avançada</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-in Global</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal bg-white',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy')
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkOut"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-out Global</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal bg-white',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy')
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="guestType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Reserva</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0 border rounded-md p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                        <FormControl>
                          <RadioGroupItem value="fisico" />
                        </FormControl>
                        <User className="w-4 h-4 text-slate-500" />
                        <FormLabel className="font-normal cursor-pointer w-full">
                          Hóspede Físico
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0 border rounded-md p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                        <FormControl>
                          <RadioGroupItem value="corporativo" />
                        </FormControl>
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <FormLabel className="font-normal cursor-pointer w-full">
                          Faturamento Corporativo
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {guestType === 'fisico' ? (
                <>
                  <FormField
                    control={form.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guestDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documento (BI/Passaporte)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nº do Documento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guestPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="+244..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="associatedCompany"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Empresa Associada (Opcional)</FormLabel>
                        <Popover open={companyPopOpen} onOpenChange={setCompanyPopOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'w-full justify-between font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value || 'Buscar empresa...'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                            <Command>
                              <CommandInput placeholder="Buscar empresa..." />
                              <CommandList>
                                <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                                <CommandGroup>
                                  {corporateGuests.map((g) => (
                                    <CommandItem
                                      key={g.id}
                                      value={g.company_name || ''}
                                      onSelect={(val) => {
                                        form.setValue('associatedCompany', val)
                                        setCompanyPopOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          g.company_name === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      {g.company_name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIF / Contribuinte</FormLabel>
                        <FormControl>
                          <Input placeholder="Nº de Contribuinte" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="contacto@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guestPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone de Contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="+244..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-slate-800">
                  Acomodações ({fields.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ typology: '', roomId: '', guestsCount: 1, rate: 0 })}
                  className="gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  <Plus className="w-4 h-4" /> Adicionar Quarto
                </Button>
              </div>

              {!checkIn || !checkOut ? (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200 animate-fade-in">
                  Por favor, selecione as datas de Check-in e Check-out primeiro para verificar a
                  disponibilidade.
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const typology = form.watch(`rooms.${index}.typology`)
                    const availableRooms = getAvailableRooms(typology)

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50/50 border rounded-lg animate-fade-in-up"
                      >
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.typology`}
                          render={({ field: f }) => (
                            <FormItem className="col-span-12 sm:col-span-3 space-y-1">
                              <FormLabel className="text-xs">Tipologia</FormLabel>
                              <Select
                                onValueChange={(val) => {
                                  f.onChange(val)
                                  form.setValue(`rooms.${index}.roomId`, '')
                                }}
                                value={f.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ROOM_TYPOLOGIES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rooms.${index}.roomId`}
                          render={({ field: f }) => (
                            <FormItem className="col-span-12 sm:col-span-4 space-y-1">
                              <FormLabel className="text-xs">Quarto</FormLabel>
                              <Select
                                onValueChange={f.onChange}
                                value={f.value}
                                disabled={!typology}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Quarto disponível" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableRooms.length === 0 && (
                                    <SelectItem value="none" disabled>
                                      Sem quartos disponíveis
                                    </SelectItem>
                                  )}
                                  {availableRooms.map((r) => (
                                    <SelectItem key={r.id} value={r.id}>
                                      Q.{r.room_number} ({r.status.replace('_', ' ')})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rooms.${index}.guestsCount`}
                          render={({ field: f }) => (
                            <FormItem className="col-span-6 sm:col-span-2 space-y-1">
                              <FormLabel className="text-xs">Hóspedes</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  {...f}
                                  onChange={(e) => f.onChange(parseInt(e.target.value) || 1)}
                                  className="bg-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rooms.${index}.rate`}
                          render={({ field: f }) => (
                            <FormItem className="col-span-6 sm:col-span-2 space-y-1">
                              <FormLabel className="text-xs">Tarifa (Total)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  {...f}
                                  onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                                  className="bg-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="col-span-12 sm:col-span-1 flex justify-end sm:mt-[22px]">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto px-8"
                disabled={isSubmitting || !checkIn || !checkOut}
              >
                {isSubmitting ? 'A Processar...' : 'Confirmar Reservas'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
