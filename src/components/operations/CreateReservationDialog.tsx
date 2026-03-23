import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, differenceInDays } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown, UserPlus, AlertCircle, Building2 } from 'lucide-react'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/use-toast'
import { getRooms, RoomRecord } from '@/services/rooms'
import { getLoyalty, createLoyalty, GuestLoyalty } from '@/services/guest_loyalty'
import { createReservation } from '@/services/reservations'
import pb from '@/lib/pocketbase/client'
import { useAccess } from '@/hooks/use-access'

const schema = z
  .object({
    guestName: z.string().min(2, 'Nome obrigatório'),
    isNewGuest: z.boolean().default(false),
    guestEmail: z.string().email('Email inválido').optional().or(z.literal('')),
    companyName: z.string().optional(),
    vatNumber: z.string().optional(),
    roomId: z.string().min(1, 'Quarto obrigatório'),
    checkIn: z.date({ required_error: 'Check-in obrigatório' }),
    checkOut: z.date({ required_error: 'Check-out obrigatório' }),
    isVip: z.boolean().default(false),
    isCorporate: z.boolean().default(false),
    totalAmount: z.number().min(0, 'Valor inválido'),
  })
  .refine((data) => data.checkOut >= data.checkIn, {
    message: 'Check-out inválido',
    path: ['checkOut'],
  })

export function CreateReservationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [rooms, setRooms] = useState<RoomRecord[]>([])
  const [guests, setGuests] = useState<GuestLoyalty[]>([])
  const [guestPopOpen, setGuestPopOpen] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)
  const [availabilityMsg, setAvailabilityMsg] = useState('')

  const { isManager } = useAccess()
  const managerAccess = isManager()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { isNewGuest: false, isVip: false, isCorporate: false, totalAmount: 0 },
  })

  const checkIn = form.watch('checkIn')
  const checkOut = form.watch('checkOut')
  const roomId = form.watch('roomId')
  const isVip = form.watch('isVip')
  const isCorporate = form.watch('isCorporate')
  const guestName = form.watch('guestName')
  const isNewGuest = form.watch('isNewGuest')

  useEffect(() => {
    if (open) {
      getRooms().then((rs) => setRooms(rs.filter((r) => !['out_of_order'].includes(r.status))))
      getLoyalty().then(setGuests)
      form.reset()
      setIsAvailable(true)
      setAvailabilityMsg('')
    }
  }, [open, form])

  useEffect(() => {
    if (checkIn && checkOut && roomId) {
      const room = rooms.find((r) => r.id === roomId)
      if (!room) return

      const type = room.room_type || 'standard'
      let baseRate = 100
      if (type === 'suite') baseRate = 250
      if (type === 'luxo') baseRate = 500

      const nights = Math.max(1, differenceInDays(checkOut, checkIn))
      let totalBase = baseRate * nights

      const month = checkIn.getMonth()
      if ([5, 6, 7, 11].includes(month)) {
        totalBase = totalBase * 1.2
      }

      let discount = 0
      const guest = guests.find((g) => g.guest_name === guestName)
      const isGold = guest?.tier === 'Gold'

      if (isGold || isVip) discount = 0.15
      else if (isCorporate) discount = 0.1

      const finalAmount = totalBase * (1 - discount)
      form.setValue('totalAmount', parseFloat(finalAmount.toFixed(2)))
    }
  }, [checkIn, checkOut, roomId, isVip, isCorporate, guestName, rooms, guests, form])

  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkIn || !checkOut || !roomId) {
        setIsAvailable(true)
        setAvailabilityMsg('')
        return
      }

      const room = rooms.find((r) => r.id === roomId)
      if (room?.status === 'maintenance') {
        setIsAvailable(false)
        setAvailabilityMsg('Quarto indisponível para o período selecionado ou em manutenção.')
        return
      }

      const inStr = format(checkIn, 'yyyy-MM-dd')
      const outStr = format(checkOut, 'yyyy-MM-dd')

      try {
        const overlaps = await pb.collection('reservations').getFullList({
          filter: `room_id = "${roomId}" && status != 'cancelado' && status != 'checked_out' && check_in < "${outStr}" && check_out > "${inStr}"`,
        })

        if (overlaps.length > 0) {
          setIsAvailable(false)
          setAvailabilityMsg('Quarto indisponível para o período selecionado ou em manutenção.')
        } else {
          setIsAvailable(true)
          setAvailabilityMsg('')
        }
      } catch (e) {
        console.error('Error checking availability', e)
      }
    }

    checkAvailability()
  }, [checkIn, checkOut, roomId, rooms])

  const onSubmit = async (v: z.infer<typeof schema>) => {
    try {
      if (v.isNewGuest) {
        await createLoyalty({
          guest_name: v.guestName,
          email: v.guestEmail,
          company_name: v.companyName,
          vat_number: v.vatNumber,
          points: 0,
          tier: 'Basic',
        })
      }

      await createReservation({
        guest_name: v.guestName,
        room_id: v.roomId,
        check_in: format(v.checkIn, 'yyyy-MM-dd'),
        check_out: format(v.checkOut, 'yyyy-MM-dd'),
        status: 'previsto',
        is_vip: v.isVip,
        is_corporate: v.isCorporate,
        balance: v.totalAmount,
      })
      toast({ title: 'Sucesso', description: 'Reserva criada com sucesso!' })
      onOpenChange(false)
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao criar reserva.', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Reserva & Check-in Rápido</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isAvailable && availabilityMsg && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4" />
                {availabilityMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guestName"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1 flex flex-col pt-2">
                    <FormLabel>Hóspede</FormLabel>
                    {!isNewGuest ? (
                      <Popover open={guestPopOpen} onOpenChange={setGuestPopOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'justify-between font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value || 'Buscar hóspede...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Buscar..." />
                            <CommandList>
                              <CommandEmpty>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-emerald-600"
                                  onClick={() => {
                                    form.setValue('isNewGuest', true)
                                    form.setValue('guestName', '')
                                    setGuestPopOpen(false)
                                  }}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" /> Criar Novo Hóspede
                                </Button>
                              </CommandEmpty>
                              <CommandGroup>
                                {guests.map((g) => (
                                  <CommandItem
                                    key={g.id}
                                    value={g.guest_name}
                                    onSelect={(val) => {
                                      const s = guests.find(
                                        (x) => x.guest_name.toLowerCase() === val.toLowerCase(),
                                      )
                                      form.setValue('guestName', s?.guest_name || val)
                                      setGuestPopOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        g.guest_name === field.value ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    {g.guest_name}
                                  </CommandItem>
                                ))}
                                {guests.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start mt-2 border-t text-emerald-600"
                                    onClick={() => {
                                      form.setValue('isNewGuest', true)
                                      form.setValue('guestName', '')
                                      setGuestPopOpen(false)
                                    }}
                                  >
                                    <UserPlus className="mr-2 h-4 w-4" /> Criar Novo Hóspede
                                  </Button>
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="space-y-2">
                        <Input placeholder="Nome completo" {...field} />
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-muted-foreground"
                          onClick={() => form.setValue('isNewGuest', false)}
                        >
                          Cancelar criação e buscar
                        </Button>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isNewGuest && (
                <FormField
                  control={form.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1 pt-2 animate-fade-in">
                      <FormLabel>E-mail (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {isNewGuest && (
                <div
                  className={cn(
                    'col-span-2 grid grid-cols-2 gap-4 p-4 rounded-lg border',
                    isCorporate ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100',
                  )}
                >
                  <div className="col-span-2 flex items-center gap-2 mb-1">
                    <Building2
                      className={cn('w-4 h-4', isCorporate ? 'text-blue-600' : 'text-slate-500')}
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      Dados Corporativos (Opcional)
                    </span>
                  </div>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome da Empresa"
                            {...field}
                            className={isCorporate ? 'bg-white' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel>Contribuinte / NIF</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Número de Contribuinte"
                            {...field}
                            className={isCorporate ? 'bg-white' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem
                    className={cn('pt-2', isNewGuest ? 'col-span-2' : 'col-span-2 sm:col-span-1')}
                  >
                    <FormLabel>Quarto Disponível</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um quarto..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            Q.{r.room_number} - {r.room_type || 'Standard'} (
                            {r.status.replace('_', ' ')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-in</FormLabel>
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
                    <FormLabel>Check-out</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1 pt-2">
                    <FormLabel>Rate Sugerida (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          field.onChange(isNaN(val) ? 0 : val)
                        }}
                        disabled={!managerAccess}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6 py-4 border-t mt-4">
              <FormField
                control={form.control}
                name="isVip"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">Marcar como VIP</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isCorporate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">
                      Faturamento Corporativo
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                disabled={!isAvailable}
              >
                Confirmar Reserva
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
