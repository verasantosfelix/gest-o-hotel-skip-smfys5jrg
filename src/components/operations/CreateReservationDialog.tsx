import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, differenceInDays } from 'date-fns'
import { CalendarIcon, Plus, Trash2, Check, ChevronsUpDown, X } from 'lucide-react'
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
import { getRoomTypeConfigs, RoomTypeConfig } from '@/services/room_type_configs'
import { getLoyalty, createLoyalty, GuestLoyalty } from '@/services/guest_loyalty'
import { createReservation } from '@/services/reservations'
import pb from '@/lib/pocketbase/client'

const ROOM_TYPOLOGIES = [
  'Single',
  'Duplo/Casal',
  'Casal',
  'Especial',
  'Quádruplo',
  'Vivenda T1',
  'Vivenda T2',
]

const roomSchema = z.object({
  typology: z.string().min(1, 'Obrigatório'),
  roomId: z.string().min(1, 'Obrigatório'),
  appliedRateType: z.string().min(1, 'Obrigatório'),
  guestsCount: z.number().min(1, 'Mínimo 1'),
  rate: z.number().min(0, 'Inválido'),
})

const schema = z
  .object({
    checkIn: z.date({ required_error: 'Obrigatório' }),
    checkOut: z.date({ required_error: 'Obrigatório' }),

    isCreatingGuest: z.boolean(),
    guestId: z.string().optional(),
    guestName: z.string().optional(),
    guestDocument: z.string().optional(),
    guestEmail: z.string().email('Email inválido').optional().or(z.literal('')),
    guestPhone: z.string().optional(),

    billingType: z.enum(['hospede', 'empresa', 'ambos']),

    isCreatingCompany: z.boolean(),
    companyId: z.string().optional(),
    companyName: z.string().optional(),
    vatNumber: z.string().optional(),
    companyEmail: z.string().email('Email inválido').optional().or(z.literal('')),
    companyPhone: z.string().optional(),

    rooms: z.array(roomSchema).min(1, 'Adicione pelo menos um quarto'),
  })
  .superRefine((data, ctx) => {
    if (data.checkOut && data.checkIn && data.checkOut <= data.checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Check-out deve ser posterior',
        path: ['checkOut'],
      })
    }

    if (data.isCreatingGuest) {
      if (!data.guestName || data.guestName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nome obrigatório',
          path: ['guestName'],
        })
      }
    } else {
      if (!data.guestId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione ou crie um hóspede',
          path: ['guestId'],
        })
      }
    }

    if (data.billingType === 'empresa' || data.billingType === 'ambos') {
      if (data.isCreatingCompany) {
        if (!data.companyName || data.companyName.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Nome da empresa obrigatório',
            path: ['companyName'],
          })
        }
      } else {
        if (!data.companyId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Selecione ou crie uma empresa',
            path: ['companyId'],
          })
        }
      }
    }
  })

export function CreateReservationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [roomsList, setRoomsList] = useState<RoomRecord[]>([])
  const [roomConfigs, setRoomConfigs] = useState<RoomTypeConfig[]>([])
  const [guests, setGuests] = useState<GuestLoyalty[]>([])
  const [overlappingRes, setOverlappingRes] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guestPopOpen, setGuestPopOpen] = useState(false)
  const [companyPopOpen, setCompanyPopOpen] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      isCreatingGuest: false,
      isCreatingCompany: false,
      billingType: 'hospede',
      rooms: [{ typology: '', roomId: '', appliedRateType: '', guestsCount: 1, rate: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms',
  })

  const checkIn = form.watch('checkIn')
  const checkOut = form.watch('checkOut')
  const selectedRooms = form.watch('rooms')
  const billingType = form.watch('billingType')
  const nights = checkIn && checkOut && checkOut > checkIn ? differenceInDays(checkOut, checkIn) : 0
  const isCreatingGuest = form.watch('isCreatingGuest')
  const isCreatingCompany = form.watch('isCreatingCompany')
  const guestId = form.watch('guestId')
  const companyId = form.watch('companyId')

  useEffect(() => {
    if (open) {
      getRooms().then(setRoomsList)
      getRoomTypeConfigs().then(setRoomConfigs)
      getLoyalty().then(setGuests)
      form.reset({
        isCreatingGuest: false,
        isCreatingCompany: false,
        billingType: 'hospede',
        rooms: [{ typology: '', roomId: '', appliedRateType: '', guestsCount: 1, rate: 0 }],
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
          filter: `(status = 'previsto' || status = 'in_house') && check_in < "${outStr}" && check_out > "${inStr}"`,
        })
        .then(setOverlappingRes)
        .catch(() => {})
    } else {
      setOverlappingRes([])
    }
  }, [checkIn, checkOut])

  useEffect(() => {
    if (nights > 0 && (roomsList.length > 0 || roomConfigs.length > 0)) {
      const currentRooms = form.getValues('rooms')
      currentRooms.forEach((r, index) => {
        if (r.roomId) {
          const room = roomsList.find((rm) => rm.id === r.roomId)
          if (room) {
            form.setValue(`rooms.${index}.rate`, (room.base_rate || 0) * nights, {
              shouldValidate: true,
            })
          }
        } else if (r.typology) {
          const config = roomConfigs.find((c) => c.name === r.typology)
          if (config) {
            form.setValue(`rooms.${index}.rate`, (config.base_price || 0) * nights, {
              shouldValidate: true,
            })
          }
        }
      })
    }
  }, [nights, roomsList, roomConfigs, form])

  const onSubmit = async (v: z.infer<typeof schema>) => {
    try {
      setIsSubmitting(true)
      let finalGuestId = v.guestId
      let finalCompanyId = v.companyId

      if (v.isCreatingGuest && !finalGuestId) {
        const newG = await createLoyalty({
          guest_name: v.guestName,
          document_id: v.guestDocument,
          email: v.guestEmail,
          phone: v.guestPhone,
          tier: 'Basic',
        })
        finalGuestId = newG.id
      }

      if (['empresa', 'ambos'].includes(v.billingType) && v.isCreatingCompany && !finalCompanyId) {
        const newC = await createLoyalty({
          guest_name: v.companyName,
          company_name: v.companyName,
          vat_number: v.vatNumber,
          email: v.companyEmail,
          phone: v.companyPhone,
          tier: 'Corporate',
        })
        finalCompanyId = newC.id
      }

      const guestNameStr = finalGuestId
        ? guests.find((g) => g.id === finalGuestId)?.guest_name
        : v.guestName

      for (const r of v.rooms) {
        await createReservation({
          guest_name: guestNameStr || 'Desconhecido',
          guest_id: finalGuestId,
          company_id: ['empresa', 'ambos'].includes(v.billingType) ? finalCompanyId : undefined,
          room_id: r.roomId,
          applied_rate_type: r.appliedRateType,
          billing_type: v.billingType,
          check_in: format(v.checkIn, 'yyyy-MM-dd'),
          check_out: format(v.checkOut, 'yyyy-MM-dd'),
          status: 'previsto',
          is_corporate: v.billingType !== 'hospede',
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
      if (
        r.status === 'Ocupado' ||
        r.status === 'Manutenção' ||
        r.status === 'maintenance' ||
        r.status === 'out_of_order'
      )
        return false
      if (typology && r.room_type !== typology) return false
      if (overlappingRes.some((ov) => ov.room_id === r.id)) return false
      if (selectedRooms.some((sr) => sr.roomId === r.id)) return false
      return true
    })
  }

  const physicalGuests = guests.filter((g) => !g.company_name)
  const totalGeral = selectedRooms.reduce((acc, curr) => acc + (Number(curr.rate) || 0), 0)
  const corporateGuests = guests.filter((g) => g.company_name)
  const selectedGuest = guests.find((g) => g.id === guestId)
  const selectedCompany = guests.find((g) => g.id === companyId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-50/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova Reserva</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border shadow-sm">
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
                              'pl-3 text-left font-normal',
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
                              'pl-3 text-left font-normal',
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

            <div className="grid grid-cols-2 gap-6">
              {/* Guest & Billing */}
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border shadow-sm space-y-4">
                  <h3 className="font-semibold text-sm text-slate-800">Hóspede Principal</h3>

                  {guestId && selectedGuest && !isCreatingGuest ? (
                    <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{selectedGuest.guest_name}</p>
                        {(selectedGuest.email || selectedGuest.document_id) && (
                          <p className="text-xs text-slate-500">
                            {selectedGuest.document_id} • {selectedGuest.email}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          form.setValue('guestId', '')
                          form.setValue('isCreatingGuest', false)
                        }}
                      >
                        Alterar
                      </Button>
                    </div>
                  ) : isCreatingGuest ? (
                    <div className="space-y-3 p-4 border border-emerald-100 rounded-md bg-emerald-50/30 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => form.setValue('isCreatingGuest', false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <h4 className="font-medium text-xs text-emerald-800 uppercase tracking-wider">
                        Novo Hóspede
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="guestName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Nome</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" {...field} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guestDocument"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Documento</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" {...field} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guestEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Email</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" {...field} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guestPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Telefone</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" {...field} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="guestId"
                      render={({ field }) => (
                        <FormItem>
                          <Popover open={guestPopOpen} onOpenChange={setGuestPopOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full justify-between bg-white text-sm',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value
                                    ? physicalGuests.find((g) => g.id === field.value)?.guest_name
                                    : 'Buscar hóspede...'}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                              <Command>
                                <CommandInput placeholder="Procurar por nome..." />
                                <CommandList>
                                  <CommandEmpty>Nenhum hóspede encontrado.</CommandEmpty>
                                  <CommandGroup>
                                    {physicalGuests.map((g) => (
                                      <CommandItem
                                        key={g.id}
                                        onSelect={() => {
                                          field.onChange(g.id)
                                          setGuestPopOpen(false)
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            g.id === field.value ? 'opacity-100' : 'opacity-0',
                                          )}
                                        />
                                        {g.guest_name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                                <div className="p-1 border-t">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full justify-start text-emerald-600 text-sm h-8"
                                    onClick={() => {
                                      form.setValue('isCreatingGuest', true)
                                      setGuestPopOpen(false)
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" /> Criar Novo Hóspede
                                  </Button>
                                </div>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Company & Billing */}
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border shadow-sm space-y-4">
                  <FormField
                    control={form.control}
                    name="billingType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="font-semibold text-sm text-slate-800">
                          Faturação (A quem faturar)
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(val) => {
                              field.onChange(val)
                              if (val === 'hospede') {
                                form.setValue('companyId', '')
                                form.setValue('isCreatingCompany', false)
                              }
                            }}
                            defaultValue={field.value}
                            className="flex space-x-2"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="hospede" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer text-sm">
                                Hóspede
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="empresa" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer text-sm">
                                Empresa
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="ambos" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer text-sm">
                                Ambos
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {['empresa', 'ambos'].includes(billingType) && (
                    <div className="pt-2">
                      {companyId && selectedCompany && !isCreatingCompany ? (
                        <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
                          <div>
                            <p className="font-medium text-sm">{selectedCompany.company_name}</p>
                            {selectedCompany.vat_number && (
                              <p className="text-xs text-slate-500">
                                NIF: {selectedCompany.vat_number}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              form.setValue('companyId', '')
                              form.setValue('isCreatingCompany', false)
                            }}
                          >
                            Alterar
                          </Button>
                        </div>
                      ) : isCreatingCompany ? (
                        <div className="space-y-3 p-4 border border-blue-100 rounded-md bg-blue-50/30 relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => form.setValue('isCreatingCompany', false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <h4 className="font-medium text-xs text-blue-800 uppercase tracking-wider">
                            Nova Empresa
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Nome Empresa</FormLabel>
                                  <FormControl>
                                    <Input className="h-8 text-sm" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="vatNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">NIF / Contribuinte</FormLabel>
                                  <FormControl>
                                    <Input className="h-8 text-sm" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="companyEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Email</FormLabel>
                                  <FormControl>
                                    <Input className="h-8 text-sm" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="companyPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Telefone</FormLabel>
                                  <FormControl>
                                    <Input className="h-8 text-sm" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ) : (
                        <FormField
                          control={form.control}
                          name="companyId"
                          render={({ field }) => (
                            <FormItem>
                              <Popover open={companyPopOpen} onOpenChange={setCompanyPopOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full justify-between bg-white text-sm',
                                        !field.value && 'text-muted-foreground',
                                      )}
                                    >
                                      {field.value
                                        ? corporateGuests.find((g) => g.id === field.value)
                                            ?.company_name
                                        : 'Buscar empresa...'}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                                  <Command>
                                    <CommandInput placeholder="Procurar por empresa..." />
                                    <CommandList>
                                      <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                                      <CommandGroup>
                                        {corporateGuests.map((g) => (
                                          <CommandItem
                                            key={g.id}
                                            onSelect={() => {
                                              field.onChange(g.id)
                                              setCompanyPopOpen(false)
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                'mr-2 h-4 w-4',
                                                g.id === field.value ? 'opacity-100' : 'opacity-0',
                                              )}
                                            />
                                            {g.company_name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                    <div className="p-1 border-t">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full justify-start text-blue-600 text-sm h-8"
                                        onClick={() => {
                                          form.setValue('isCreatingCompany', true)
                                          setCompanyPopOpen(false)
                                        }}
                                      >
                                        <Plus className="w-4 h-4 mr-2" /> Criar Nova Empresa
                                      </Button>
                                    </div>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div className="space-y-4 p-4 bg-white rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-800">
                  Acomodações ({fields.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      typology: '',
                      roomId: '',
                      appliedRateType: '',
                      guestsCount: 1,
                      rate: 0,
                    })
                  }
                  className="gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-8 text-xs"
                >
                  <Plus className="w-3 h-3" /> Adicionar Quarto
                </Button>
              </div>

              {!checkIn || !checkOut ? (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200 animate-fade-in">
                  Selecione as datas de Check-in e Check-out para verificar a disponibilidade.
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const typology = form.watch(`rooms.${index}.typology`)
                    const availableRooms = getAvailableRooms(typology)

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50 border rounded-lg animate-fade-in-up"
                      >
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.typology`}
                          render={({ field: f }) => (
                            <FormItem className="col-span-12 sm:col-span-2 space-y-1">
                              <FormLabel className="text-xs">Físico</FormLabel>
                              <Select
                                onValueChange={(val) => {
                                  f.onChange(val)
                                  form.setValue(`rooms.${index}.roomId`, '')
                                  const config = roomConfigs.find((c) => c.name === val)
                                  if (config && nights > 0) {
                                    form.setValue(
                                      `rooms.${index}.rate`,
                                      (config.base_price || 0) * nights,
                                      { shouldValidate: true },
                                    )
                                  } else {
                                    form.setValue(`rooms.${index}.rate`, 0, {
                                      shouldValidate: true,
                                    })
                                  }
                                }}
                                value={f.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white h-8 text-xs">
                                    <SelectValue placeholder="Tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ROOM_TYPOLOGIES.map((t) => (
                                    <SelectItem key={t} value={t} className="text-xs">
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rooms.${index}.roomId`}
                          render={({ field: f }) => (
                            <FormItem className="col-span-12 sm:col-span-3 space-y-1">
                              <FormLabel className="text-xs">Quarto Disponível</FormLabel>
                              <Select
                                onValueChange={(val) => {
                                  f.onChange(val)
                                  const room = roomsList.find((rm) => rm.id === val)
                                  if (room && nights > 0) {
                                    form.setValue(
                                      `rooms.${index}.rate`,
                                      (room.base_rate || 0) * nights,
                                      {
                                        shouldValidate: true,
                                      },
                                    )
                                  }
                                }}
                                value={f.value}
                                disabled={!typology}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white h-8 text-xs">
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableRooms.length === 0 && (
                                    <SelectItem value="none" disabled className="text-xs">
                                      Indisponível
                                    </SelectItem>
                                  )}
                                  {availableRooms.map((r) => (
                                    <SelectItem key={r.id} value={r.id} className="text-xs">
                                      {r.bloco}-{r.room_number}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rooms.${index}.appliedRateType`}
                          render={({ field: f }) => (
                            <FormItem className="col-span-12 sm:col-span-3 space-y-1">
                              <FormLabel className="text-xs">Tarifa Aplicada</FormLabel>
                              <Select
                                onValueChange={(val) => {
                                  f.onChange(val)
                                  const roomId = form.getValues(`rooms.${index}.roomId`)
                                  const room = roomsList.find((rm) => rm.id === roomId)
                                  if (room && nights > 0) {
                                    form.setValue(
                                      `rooms.${index}.rate`,
                                      (room.base_rate || 0) * nights,
                                      {
                                        shouldValidate: true,
                                      },
                                    )
                                  } else if (!roomId && nights > 0) {
                                    const config = roomConfigs.find((c) => c.name === val)
                                    if (config) {
                                      form.setValue(
                                        `rooms.${index}.rate`,
                                        (config.base_price || 0) * nights,
                                        {
                                          shouldValidate: true,
                                        },
                                      )
                                    }
                                  }
                                }}
                                value={f.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white h-8 text-xs">
                                    <SelectValue placeholder="Cobrar como..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ROOM_TYPOLOGIES.map((t) => (
                                    <SelectItem key={t} value={t} className="text-xs">
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rooms.${index}.guestsCount`}
                          render={({ field: f }) => (
                            <FormItem className="col-span-6 sm:col-span-1 space-y-1">
                              <FormLabel className="text-xs">Hósp.</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  {...f}
                                  onChange={(e) => f.onChange(parseInt(e.target.value) || 1)}
                                  className="bg-white h-8 text-xs"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rooms.${index}.rate`}
                          render={({ field: f }) => (
                            <FormItem className="col-span-6 sm:col-span-2 space-y-1">
                              <FormLabel className="text-xs">Total (Kz)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  {...f}
                                  onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                                  className="bg-white h-8 text-xs"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
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
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-8 w-8"
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

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t">
              <div className="text-sm font-semibold text-slate-700">
                Total Geral ({nights} {nights === 1 ? 'noite' : 'noites'}):
                <span className="text-lg text-emerald-700 ml-2">
                  {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(
                    totalGeral,
                  )}
                </span>
              </div>
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto px-8 mt-4 sm:mt-0"
                disabled={isSubmitting || !checkIn || !checkOut}
              >
                {isSubmitting ? 'A Processar...' : 'Confirmar Reserva'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
