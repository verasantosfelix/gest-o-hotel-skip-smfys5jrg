import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { MessageSquare, Send, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useAuthStore from '@/stores/useAuthStore'

export default function Communication() {
  const { userRole } = useAuthStore()

  const [msgStep, setMsgStep] = useState(1)
  const [msgForm, setMsgForm] = useState({
    canal: '',
    mensagem: '',
    destinatario: '',
    segmento: '',
  })
  const [msgError, setMsgError] = useState('')
  const [msgOutput, setMsgOutput] = useState('')

  const [autoForm, setAutoForm] = useState({ gatilho: '', mensagem: '' })
  const [autoError, setAutoError] = useState('')
  const [autoOutput, setAutoOutput] = useState('')

  if (userRole !== 'Admin' && userRole !== 'Administrativa') {
    return <Navigate to="/" replace />
  }

  const handleMsgNext1 = () => {
    if (!msgForm.canal || !msgForm.mensagem.trim()) {
      setMsgError('Canal e mensagem são campos obrigatórios.')
      return
    }
    setMsgError('')
    setMsgStep(2)
  }

  const handleMsgNext2 = () => {
    setMsgStep(3)
  }

  const handleMsgConfirm = () => {
    setMsgStep(4)
    setMsgOutput(
      `<OUTPUT>\n  <status>Mensagem enviada</status>\n  <detalhes>\n    <canal>${msgForm.canal}</canal>\n    <destinatario>${msgForm.destinatario || 'N/A'}</destinatario>\n    <segmento>${msgForm.segmento && msgForm.segmento !== 'none' ? msgForm.segmento : 'N/A'}</segmento>\n  </detalhes>\n</OUTPUT>`,
    )
  }

  const handleAutoSubmit = () => {
    if (!autoForm.gatilho || !autoForm.mensagem.trim()) {
      setAutoError('Gatilho e mensagem automática são campos obrigatórios.')
      return
    }
    setAutoError('')
    setAutoOutput(
      `<OUTPUT>\n  <status>Automação configurada</status>\n  <detalhes>\n    <gatilho>${autoForm.gatilho}</gatilho>\n  </detalhes>\n</OUTPUT>`,
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Comunicação Omnichannel
        </h1>
        <p className="text-muted-foreground text-sm">
          Centralize comunicação via WhatsApp, Email, SMS, notificações push e automações para
          hóspedes e staff.
        </p>
      </div>

      <Tabs defaultValue="enviar-mensagem" className="w-full max-w-3xl">
        <TabsList className="mb-4 bg-slate-100 p-1 flex w-full sm:w-auto h-auto">
          <TabsTrigger value="enviar-mensagem" className="flex-1 sm:flex-none">
            Nova Mensagem (Broadcast)
          </TabsTrigger>
          <TabsTrigger value="automacao" className="flex-1 sm:flex-none">
            Configurar Automação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enviar-mensagem">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" /> Envio de Mensagem Direta
              </CardTitle>
              <CardDescription>
                Dispare comunicados em massa ou mensagens direcionadas a segmentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {msgStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>
                      Canal <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={msgForm.canal}
                      onValueChange={(v) => setMsgForm({ ...msgForm, canal: v })}
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Selecione o canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Email">E-mail</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="Push">Notificação Push (App)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Mensagem <span className="text-rose-500">*</span>
                    </Label>
                    <Textarea
                      className="bg-slate-50 min-h-[120px]"
                      value={msgForm.mensagem}
                      onChange={(e) => setMsgForm({ ...msgForm, mensagem: e.target.value })}
                      placeholder="Escreva o conteúdo da mensagem..."
                    />
                  </div>
                  {msgError && (
                    <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-md flex items-center gap-2 border border-rose-200">
                      <AlertTriangle className="w-4 h-4" /> {msgError}
                    </div>
                  )}
                  <Button onClick={handleMsgNext1} className="w-full sm:w-auto">
                    Avançar
                  </Button>
                </div>
              )}

              {msgStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Destinatário Específico (Opcional)</Label>
                    <Input
                      className="bg-slate-50"
                      value={msgForm.destinatario}
                      onChange={(e) => setMsgForm({ ...msgForm, destinatario: e.target.value })}
                      placeholder="Ex: joao.silva@email.com, ou ID Hóspede"
                    />
                  </div>
                  <div className="relative py-2 flex items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">
                      ou escolha um
                    </span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Segmento / Broadcast (Opcional)</Label>
                    <Select
                      value={msgForm.segmento}
                      onValueChange={(v) => setMsgForm({ ...msgForm, segmento: v })}
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Selecione um grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum Segmento</SelectItem>
                        <SelectItem value="Todos">Todos os Hóspedes Ativos (Broadcast)</SelectItem>
                        <SelectItem value="In-House">Hóspedes In-House</SelectItem>
                        <SelectItem value="VIPs">Somente VIPs</SelectItem>
                        <SelectItem value="Staff">Equipe Geral / Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setMsgStep(1)}
                      className="flex-1 sm:flex-none"
                    >
                      Voltar
                    </Button>
                    <Button onClick={handleMsgNext2} className="flex-1 sm:flex-none">
                      Revisar Envio
                    </Button>
                  </div>
                </div>
              )}

              {msgStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 font-bold">
                      Confirmação de Disparo
                    </AlertTitle>
                    <AlertDescription className="text-amber-700 mt-2">
                      <p>Enviar mensagem agora?</p>
                      <ul className="mt-2 text-sm font-medium space-y-1">
                        <li>Canal: {msgForm.canal}</li>
                        <li>
                          Alvo:{' '}
                          {msgForm.destinatario ||
                            msgForm.segmento ||
                            'Não especificado (Pode não ser entregue)'}
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setMsgStep(2)}
                      className="flex-1 sm:flex-none"
                    >
                      Cancelar e Voltar
                    </Button>
                    <Button
                      onClick={handleMsgConfirm}
                      className="bg-slate-900 hover:bg-slate-800 text-white flex-1 sm:flex-none"
                    >
                      Confirmar e Enviar
                    </Button>
                  </div>
                </div>
              )}

              {msgStep === 4 && (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-center gap-3 border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h4 className="font-bold">Ação Concluída</h4>
                      <p className="text-sm">A mensagem foi processada e enviada com sucesso.</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 uppercase font-bold mb-2 block">
                      Output Gerado:
                    </Label>
                    <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner whitespace-pre-wrap">
                      {msgOutput}
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMsgStep(1)
                      setMsgForm({ canal: '', mensagem: '', destinatario: '', segmento: '' })
                      setMsgOutput('')
                    }}
                    className="w-full sm:w-auto"
                  >
                    Nova Mensagem
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automacao">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" /> Automação de Fluxos
              </CardTitle>
              <CardDescription>
                Crie mensagens que são enviadas automaticamente após gatilhos específicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!autoOutput ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>
                      Gatilho (Evento) <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={autoForm.gatilho}
                      onValueChange={(v) => setAutoForm({ ...autoForm, gatilho: v })}
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Selecione o evento de disparo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="check-in">Pós Check-in</SelectItem>
                        <SelectItem value="reserva">Confirmação de Reserva</SelectItem>
                        <SelectItem value="evento">Início de Evento</SelectItem>
                        <SelectItem value="check-out">Pós Check-out (Feedback)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Mensagem Automática <span className="text-rose-500">*</span>
                    </Label>
                    <Textarea
                      className="bg-slate-50 min-h-[120px]"
                      value={autoForm.mensagem}
                      onChange={(e) => setAutoForm({ ...autoForm, mensagem: e.target.value })}
                      placeholder="Escreva a mensagem que será enviada automaticamente..."
                    />
                  </div>
                  {autoError && (
                    <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-md flex items-center gap-2 border border-rose-200">
                      <AlertTriangle className="w-4 h-4" /> {autoError}
                    </div>
                  )}
                  <Button
                    onClick={handleAutoSubmit}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Salvar Automação
                  </Button>
                </div>
              ) : (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-center gap-3 border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h4 className="font-bold">Regra Salva</h4>
                      <p className="text-sm">O fluxo de mensagens automáticas foi ativado.</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 uppercase font-bold mb-2 block">
                      Output Gerado:
                    </Label>
                    <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner whitespace-pre-wrap">
                      {autoOutput}
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAutoForm({ gatilho: '', mensagem: '' })
                      setAutoOutput('')
                    }}
                    className="w-full sm:w-auto"
                  >
                    Criar Nova Automação
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
