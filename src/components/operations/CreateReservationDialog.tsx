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
import { Badge } from '@/components/ui/badge'
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
import { getRoomDiscounts, RoomDiscount } from '@/services/room_discounts'
import { getLoyalty, createLoyalty, GuestLoyalty } from '@/services/guest_loyalty'
import { createReservation } from '@/services/reservations'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'

const roomSchema = z.object({
  typology: z.string().min(1, 'Selecione uma tipologia'),
  roomId: z.string().min(1, 'Selecione um quarto'),
  discountId: z.string().optional(),
  guestsCount: z.number().min(1, 'Mínimo 1 hóspede'),
  rate: z.number().min(0, 'Valor inválido'),
})

const schema = z
  .object({
    reservationType: z.enum(['individual', 'corporate']).default('individual'),
    checkIn: z.date({ required_error: 'Data de check-in obrigatória' }),
    checkOut: z.date({ required_error: 'Data de check-out obrigatória' }),
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
    additionalGuests: z.array(z.string()).optional(),
    rooms: z.array(roomSchema).min(1, 'Adicione pelo menos um quarto'),
  })
  .superRefine((data, ctx) => {
    if (data.checkOut && data.checkIn && data.checkOut <= data.checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'O check-out deve ser posterior ao check-in',
        path: ['checkOut'],
      })
    }
    if (data.reservationType === 'corporate') {
      if (data.isCreatingCompany) {
        if (!data.companyName || data.companyName.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'O nome da empresa é obrigatório',
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
    } else {
      if (data.isCreatingGuest) {
        if (!data.guestName || data.guestName.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'O nome do hóspede é obrigatório',
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
          if (!data.companyName || data.companyName.trim().length < 2) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'O nome da empresa é obrigatório',
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
  const [discounts, setDiscounts] = useState<RoomDiscount[]>([])
  const [guests, setGuests] = useState<GuestLoyalty[]>([])
  const [overlappingRes, setOverlappingRes] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guestPopOpen, setGuestPopOpen] = useState(false)
  const [companyPopOpen, setCompanyPopOpen] = useState(false)
  const [associatedGuestsPopOpen, setAssociatedGuestsPopOpen] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      reservationType: 'individual',
      isCreatingGuest: false,
      isCreatingCompany: false,
      billingType: 'hospede',
      additionalGuests: [],
      rooms: [{ typology: '', roomId: '', discountId: 'none', guestsCount: 1, rate: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'rooms' })

  const reservationType = form.watch('reservationType')
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
      Promise.all([getRooms(), getRoomTypeConfigs(), getRoomDiscounts(), getLoyalty()]).then(
        ([rs, rtc, rd, g]) => {
          setRoomsList(rs)
          setRoomConfigs(rtc)
          setDiscounts(rd)
          setGuests(g)
        },
      )
      form.reset({
        reservationType: 'individual',
        isCreatingGuest: false,
        isCreatingCompany: false,
        billingType: 'hospede',
        additionalGuests: [],
        rooms: [{ typology: '', roomId: '', discountId: 'none', guestsCount: 1, rate: 0 }],
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

  const calculateRoomRate = (typology: string, discountId: string | undefined) => {
    if (!typology || nights <= 0) return 0
    const config = roomConfigs.find((c) => c.name === typology)
    const basePrice = config?.base_price || 0
    let total = basePrice * nights

    if (discountId && discountId !== 'none') {
      const discount = discounts.find((d) => d.id === discountId)
      if (discount) {
        if (discount.type === 'percentage') {
          total = total * (1 - discount.value / 100)
        } else {
          total = Math.max(0, total - discount.value)
        }
      }
    }
    return total
  }

  useEffect(() => {
    if (nights > 0 && roomConfigs.length > 0) {
      const currentRooms = form.getValues('rooms')
      currentRooms.forEach((r, index) => {
        form.setValue(`rooms.${index}.rate`, calculateRoomRate(r.typology, r.discountId), {
          shouldValidate: true,
        })
      })
    }
  }, [nights, roomConfigs, discounts, form])

  // Real-time validation for room availability based on dates
  useEffect(() => {
    const currentRooms = form.getValues('rooms')
    currentRooms.forEach((r, index) => {
      if (r.roomId && r.typology) {
        const available = getAvailableRooms(r.typology, index)
        const isAvailable = available.some((ar) => ar.id === r.roomId)

        if (!isAvailable) {
          form.setValue(`rooms.${index}.roomId`, '', { shouldValidate: false })
          form.setError(`rooms.${index}.roomId`, {
            type: 'manual',
            message:
              'O quarto selecionado não está disponível para as datas escolhidas. Selecione outro quarto ou altere as datas.',
          })
        } else {
          const currentError = form.getFieldState(`rooms.${index}.roomId`).error
          if (currentError?.type === 'manual') {
            form.clearErrors(`rooms.${index}.roomId`)
          }
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlappingRes, roomsList, selectedRooms, form])

  const onSubmit = async (v: z.infer<typeof schema>) => {
    // Validate room availability before submitting
    let hasRoomErrors = false
    for (let i = 0; i < v.rooms.length; i++) {
      const r = v.rooms[i]
      if (r.roomId) {
        const available = getAvailableRooms(r.typology, i)
        if (!available.some((ar) => ar.id === r.roomId)) {
          form.setError(`rooms.${i}.roomId`, {
            type: 'manual',
            message:
              'O quarto selecionado não está disponível para as datas escolhidas. Selecione outro quarto ou altere as datas.',
          })
          hasRoomErrors = true
        }
      }
    }

    if (hasRoomErrors) {
      toast({
        title: 'Erro de validação',
        description: 'Um ou mais quartos não estão disponíveis para as datas selecionadas.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      let finalGuestId = v.guestId
      let finalCompanyId = v.companyId

      if (v.reservationType === 'individual') {
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

        if (
          ['empresa', 'ambos'].includes(v.billingType) &&
          v.isCreatingCompany &&
          !finalCompanyId
        ) {
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
      } else {
        if (v.isCreatingCompany && !finalCompanyId) {
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
      }

      for (const r of v.rooms) {
        const payload: any = {
          room_id: r.roomId,
          check_in: format(v.checkIn, 'yyyy-MM-dd'),
          check_out: format(v.checkOut, 'yyyy-MM-dd'),
          status: 'previsto',
          balance: r.rate,
          total_value: r.rate,
          guests_count: r.guestsCount,
        }

        if (r.typology) {
          payload.applied_rate_type = r.typology
        }

        if (v.reservationType === 'corporate') {
          const companyNameStr = finalCompanyId
            ? guests.find((g) => g.id === finalCompanyId)?.company_name
            : v.companyName

          payload.guest_name = companyNameStr || 'Empresa Desconhecida'
          payload.billing_type = 'empresa'
          payload.is_corporate = true

          if (finalCompanyId) payload.company_id = finalCompanyId

          if (v.additionalGuests && v.additionalGuests.length > 0) {
            payload.additional_guests = v.additionalGuests
          }
        } else {
          const guestNameStr = finalGuestId
            ? guests.find((g) => g.id === finalGuestId)?.guest_name
            : v.guestName

          payload.guest_name = guestNameStr || 'Desconhecido'
          payload.billing_type = v.billingType
          payload.is_corporate = false

          if (finalGuestId) payload.guest_id = finalGuestId
          if (['empresa', 'ambos'].includes(v.billingType) && finalCompanyId) {
            payload.company_id = finalCompanyId
          }
        }

        await createReservation(payload)
      }

      toast({ title: 'Sucesso', description: 'Reserva(s) criada(s) com sucesso!' })
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      const msg = getErrorMessage(err)
      toast({ title: 'Erro', description: msg || 'Erro ao criar reserva.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onInvalid = () => {
    toast({
      title: 'Erro de validação',
      description: 'Verifique os campos assinalados antes de confirmar.',
      variant: 'destructive',
    })
  }

  const getAvailableRooms = (typology: string, currentIndex: number) => {
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
      if (selectedRooms.some((sr, idx) => idx !== currentIndex && sr.roomId === r.id)) return false
      return true
    })
  }

  const physicalGuests = guests.filter((g) => !g.company_name)
  const totalGeral = selectedRooms.reduce((acc, curr) => acc + (Number(curr.rate) || 0), 0)
  const corporateGuests = guests.filter((g) => g.company_name)
  const selectedGuest = guests.find((g) => g.id === guestId)
  const selectedCompany = guests.find((g) => g.id === companyId)

  const renderCompanyBlock = () => {
    return (
      <div className="pt-2">
        {companyId && selectedCompany && !isCreatingCompany ? (
          <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
            <div>
              <p className="font-medium text-sm">{selectedCompany.company_name}</p>
              {selectedCompany.vat_number && (
                <p className="text-xs text-slate-500">NIF: {selectedCompany.vat_number}</p>
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
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Nome Empresa</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          'h-8 text-sm',
                          fieldState.invalid && 'border-destructive focus-visible:ring-destructive',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs">NIF / Contribuinte</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          'h-8 text-sm',
                          fieldState.invalid && 'border-destructive focus-visible:ring-destructive',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyEmail"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Email</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          'h-8 text-sm',
                          fieldState.invalid && 'border-destructive focus-visible:ring-destructive',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyPhone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Telefone</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          'h-8 text-sm',
                          fieldState.invalid && 'border-destructive focus-visible:ring-destructive',
                        )}
                        {...field}
                      />
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
            render={({ field, fieldState }) => (
              <FormItem>
                <Popover open={companyPopOpen} onOpenChange={setCompanyPopOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-between bg-white text-sm',
                          !field.value && 'text-muted-foreground',
                          fieldState.invalid && 'border-destructive text-destructive',
                        )}
                      >
                        {field.value
                          ? corporateGuests.find((g) => g.id === field.value)?.company_name
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
    )
  }

  const renderAssociatedGuests = () => (
    <div className="p-4 bg-white rounded-lg border shadow-sm space-y-4">
      <FormField
        control={form.control}
        name="additionalGuests"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="font-semibold text-sm text-slate-800">
              Hóspedes Associados
            </FormLabel>
            <Popover open={associatedGuestsPopOpen} onOpenChange={setAssociatedGuestsPopOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-between bg-white text-sm h-auto min-h-[40px] py-2',
                      (!field.value || field.value.length === 0) && 'text-muted-foreground',
                      fieldState.invalid && 'border-destructive text-destructive',
                    )}
                  >
                    {field.value && field.value.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {field.value.map((id) => {
                          const g = physicalGuests.find((g) => g.id === id)
                          return g ? (
                            <Badge key={id} variant="secondary" className="mr-1">
                              {g.guest_name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    ) : (
                      'Selecionar hóspedes...'
                    )}
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
                      {physicalGuests.map((g) => {
                        const isSelected = field.value?.includes(g.id)
                        return (
                          <CommandItem
                            key={g.id}
                            onSelect={() => {
                              const current = field.value || []
                              const newVals = isSelected
                                ? current.filter((val) => val !== g.id)
                                : [...current, g.id]
                              field.onChange(newVals)
                            }}
                          >
                            <div
                              className={cn(
                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'opacity-50 [&_svg]:invisible',
                              )}
                            >
                              <Check className={cn('h-4 w-4')} />
                            </div>
                            {g.guest_name}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-50/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova Reserva</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6 mt-2">
            <FormField
              control={form.control}
              name="reservationType"
              render={({ field }) => (
                <FormItem className="space-y-3 p-4 bg-white rounded-lg border shadow-sm">
                  <FormLabel className="font-semibold text-sm text-slate-800">
                    Tipo de Reserva
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(val) => {
                        field.onChange(val)
                        if (val === 'corporate') {
                          form.setValue('billingType', 'empresa')
                        } else {
                          form.setValue('billingType', 'hospede')
                        }
                      }}
                      defaultValue={field.value}
                      className="flex space-x-6"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="individual" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer text-sm">
                          Individual (Particular)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="corporate" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer text-sm">
                          Corporate (Empresa)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border shadow-sm">
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field, fieldState }) => (
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
                              fieldState.invalid && 'border-destructive text-destructive',
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
                render={({ field, fieldState }) => (
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
                              fieldState.invalid && 'border-destructive text-destructive',
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
              {reservationType === 'individual' ? (
                <>
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
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Nome</FormLabel>
                                  <FormControl>
                                    <Input
                                      className={cn(
                                        'h-8 text-sm',
                                        fieldState.invalid &&
                                          'border-destructive focus-visible:ring-destructive',
                                      )}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="guestDocument"
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Documento</FormLabel>
                                  <FormControl>
                                    <Input
                                      className={cn(
                                        'h-8 text-sm',
                                        fieldState.invalid &&
                                          'border-destructive focus-visible:ring-destructive',
                                      )}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="guestEmail"
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      className={cn(
                                        'h-8 text-sm',
                                        fieldState.invalid &&
                                          'border-destructive focus-visible:ring-destructive',
                                      )}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="guestPhone"
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Telefone</FormLabel>
                                  <FormControl>
                                    <Input
                                      className={cn(
                                        'h-8 text-sm',
                                        fieldState.invalid &&
                                          'border-destructive focus-visible:ring-destructive',
                                      )}
                                      {...field}
                                    />
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
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <Popover open={guestPopOpen} onOpenChange={setGuestPopOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full justify-between bg-white text-sm',
                                        !field.value && 'text-muted-foreground',
                                        fieldState.invalid && 'border-destructive text-destructive',
                                      )}
                                    >
                                      {field.value
                                        ? physicalGuests.find((g) => g.id === field.value)
                                            ?.guest_name
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

                      {['empresa', 'ambos'].includes(billingType) && renderCompanyBlock()}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border shadow-sm space-y-4">
                      <h3 className="font-semibold text-sm text-slate-800">Empresa Principal</h3>
                      {renderCompanyBlock()}
                    </div>
                  </div>
                  <div className="space-y-4">{renderAssociatedGuests()}</div>
                </>
              )}
            </div>

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
                      discountId: 'none',
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
                    const currentRoomId = form.watch(`rooms.${index}.roomId`)
                    const availableRooms = getAvailableRooms(typology, index)
                    const currentRoom = roomsList.find((r) => r.id === currentRoomId)
                    const isCurrentRoomUnavailable =
                      currentRoomId && !availableRooms.some((r) => r.id === currentRoomId)

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50 border rounded-lg animate-fade-in-up"
                      >
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.typology`}
                          render={({ field: f, fieldState }) => (
                            <FormItem className="col-span-12 sm:col-span-3 space-y-1">
                              <FormLabel className="text-xs">Tipologia</FormLabel>
                              <Select
                                onValueChange={(val) => {
                                  f.onChange(val)
                                  form.setValue(`rooms.${index}.roomId`, '')
                                  const discountId = form.getValues(`rooms.${index}.discountId`)
                                  form.setValue(
                                    `rooms.${index}.rate`,
                                    calculateRoomRate(val, discountId),
                                    { shouldValidate: true },
                                  )
                                }}
                                value={f.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={cn(
                                      'bg-white h-8 text-xs',
                                      fieldState.invalid &&
                                        'border-destructive focus:ring-destructive',
                                    )}
                                  >
                                    <SelectValue placeholder="Selecione o tipo..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {roomConfigs.map((c) => (
                                    <SelectItem key={c.id} value={c.name} className="text-xs">
                                      {c.name}
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
                          render={({ field: f, fieldState }) => (
                            <FormItem className="col-span-12 sm:col-span-3 space-y-1">
                              <FormLabel className="text-xs">Quarto</FormLabel>
                              <Select
                                onValueChange={(val) => {
                                  f.onChange(val)
                                  form.clearErrors(`rooms.${index}.roomId`)
                                }}
                                value={f.value}
                                disabled={!typology}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={cn(
                                      'bg-white h-8 text-xs',
                                      fieldState.invalid &&
                                        'border-destructive text-destructive focus:ring-destructive',
                                    )}
                                  >
                                    <SelectValue placeholder="Selecione um quarto" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableRooms.length === 0 && !isCurrentRoomUnavailable && (
                                    <SelectItem value="none" disabled className="text-xs">
                                      Indisponível
                                    </SelectItem>
                                  )}
                                  {isCurrentRoomUnavailable && currentRoom && (
                                    <SelectItem
                                      key={currentRoom.id}
                                      value={currentRoom.id}
                                      className="text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                                    >
                                      {currentRoom.bloco}-{currentRoom.room_number} (Ocupado)
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
                          name={`rooms.${index}.discountId`}
                          render={({ field: f, fieldState }) => (
                            <FormItem className="col-span-12 sm:col-span-3 space-y-1">
                              <FormLabel className="text-xs">Desconto Aplicado</FormLabel>
                              <Select
                                onValueChange={(val) => {
                                  f.onChange(val)
                                  const selectedTypology = form.getValues(`rooms.${index}.typology`)
                                  form.setValue(
                                    `rooms.${index}.rate`,
                                    calculateRoomRate(selectedTypology, val),
                                    { shouldValidate: true },
                                  )
                                }}
                                value={f.value || 'none'}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={cn(
                                      'bg-white h-8 text-xs',
                                      fieldState.invalid &&
                                        'border-destructive focus:ring-destructive',
                                    )}
                                  >
                                    <SelectValue placeholder="Nenhum" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none" className="text-xs">
                                    Sem Desconto
                                  </SelectItem>
                                  {discounts.map((d) => (
                                    <SelectItem key={d.id} value={d.id} className="text-xs">
                                      {d.name}
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
                          render={({ field: f, fieldState }) => (
                            <FormItem className="col-span-6 sm:col-span-1 space-y-1">
                              <FormLabel className="text-xs">Hósp.</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  {...f}
                                  onChange={(e) => f.onChange(parseInt(e.target.value) || 1)}
                                  className={cn(
                                    'bg-white h-8 text-xs',
                                    fieldState.invalid &&
                                      'border-destructive focus-visible:ring-destructive',
                                  )}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rooms.${index}.rate`}
                          render={({ field: f, fieldState }) => (
                            <FormItem className="col-span-6 sm:col-span-2 space-y-1">
                              <FormLabel className="text-xs">Total (Kz)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  {...f}
                                  onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                                  className={cn(
                                    'bg-white h-8 text-xs font-semibold text-emerald-700',
                                    fieldState.invalid &&
                                      'border-destructive focus-visible:ring-destructive',
                                  )}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />

                        {fields.length > 1 && (
                          <div className="col-span-12 sm:col-span-12 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-8 text-xs"
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Remover Quarto
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {form.formState.errors.rooms && form.formState.errors.rooms.root && (
                    <div className="text-xs text-destructive mt-2">
                      {form.formState.errors.rooms.root.message}
                    </div>
                  )}
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
