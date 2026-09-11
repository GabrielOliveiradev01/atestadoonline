import { useEffect, useState } from 'react'
import { DadosScreen } from './components/DadosScreen'
import { PagamentoScreen } from './components/PagamentoScreen'
import { PdfScreen } from './components/PdfScreen'
import { emptyAtestado, type AtestadoData } from './types'
import { planoPorId, type PlanoId } from './data/planos'
import { salvarAtestado } from './services/atestados'
import {
  clearPagamentoSession,
  gerarPix,
  loadPagamentoSession,
  savePagamentoSession,
  verificarPagamentoWebhook,
  type PixInfo,
} from './services/asaas'
import './App.css'

type Screen = 'pagamento' | 'dados' | 'pdf'

function applyPlano(data: AtestadoData, planoId: PlanoId): AtestadoData {
  const plano = planoPorId(planoId)
  if (!plano) return data
  return {
    ...data,
    tipoRecomendacao: 'afastado_dias',
    diasAfastamento: plano.diasAfastamento,
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('pagamento')
  const [data, setData] = useState<AtestadoData>(emptyAtestado)
  const [protocolo, setProtocolo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [planoId, setPlanoId] = useState<PlanoId | null>(null)
  const [pix, setPix] = useState<PixInfo | null>(null)
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [payStatus, setPayStatus] = useState<string | null>(null)
  const [awaitingWebhook, setAwaitingWebhook] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(true)

  const liberarDados = (id: PlanoId, paymentId: string, pixInfo?: PixInfo | null) => {
    savePagamentoSession({
      paymentId,
      planoId: id,
      paid: true,
      pix: pixInfo || undefined,
    })
    setPlanoId(id)
    setData((prev) => applyPlano(prev, id))
    setAwaitingWebhook(false)
    setPayStatus(null)
    setScreen('dados')
  }

  // Restaura sessão paga ou Pix pendente
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const stored = loadPagamentoSession()
      if (!stored) {
        if (!cancelled) setBootstrapping(false)
        return
      }

      if (stored.paid) {
        setPlanoId(stored.planoId)
        setData((prev) => applyPlano(prev, stored.planoId))
        setScreen('dados')
        if (!cancelled) setBootstrapping(false)
        return
      }

      // Ainda pendente: reconsulta webhook e, se houver, mostra QR de novo
      setPlanoId(stored.planoId)
      if (stored.pix) setPix(stored.pix)

      try {
        const status = await verificarPagamentoWebhook(stored.paymentId)
        if (cancelled) return
        if (status.paid) {
          liberarDados(
            (status.planoId || stored.planoId) as PlanoId,
            stored.paymentId,
            stored.pix,
          )
        } else if (stored.pix) {
          setAwaitingWebhook(true)
        }
      } catch {
        if (stored.pix && !cancelled) setAwaitingWebhook(true)
      }

      if (!cancelled) setBootstrapping(false)
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Polling: libera só quando o webhook marcar paid no banco
  useEffect(() => {
    if (!pix?.paymentId || screen !== 'pagamento') return

    let cancelled = false
    setAwaitingWebhook(true)

    const tick = async () => {
      try {
        const status = await verificarPagamentoWebhook(pix.paymentId)
        if (cancelled) return
        if (status.paid) {
          liberarDados(
            (status.planoId || pix.planoId) as PlanoId,
            pix.paymentId,
            pix,
          )
        }
      } catch {
        /* mantém aguardando */
      }
    }

    void tick()
    const id = window.setInterval(tick, 3000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pix?.paymentId, screen])

  const handleGerarPix = async () => {
    if (!planoId || payLoading) return
    setPayLoading(true)
    setPayError(null)
    setPayStatus(null)
    try {
      const gerado = await gerarPix(planoId)
      setPix(gerado)
      savePagamentoSession({
        paymentId: gerado.paymentId,
        planoId,
        paid: false,
        pix: gerado,
      })
      setAwaitingWebhook(true)
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Não foi possível gerar o Pix.')
    } finally {
      setPayLoading(false)
    }
  }

  const handleNovoPix = () => {
    setPix(null)
    setAwaitingWebhook(false)
    setPayError(null)
    setPayStatus(null)
    clearPagamentoSession()
  }

  const handleGerar = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const result = await salvarAtestado(data)
      if (!result.ok) {
        setSaveError('Não foi possível gerar o atestado. Tente novamente.')
        return
      }
      setProtocolo(result.protocolo)
      setScreen('pdf')
    } catch {
      setSaveError('Não foi possível gerar o atestado. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (bootstrapping) {
    return (
      <div className="app-boot">
        <p>Carregando…</p>
      </div>
    )
  }

  if (screen === 'pdf') {
    return (
      <PdfScreen
        data={data}
        protocolo={protocolo}
        onVoltar={() => setScreen('dados')}
      />
    )
  }

  if (screen === 'dados') {
    return (
      <DadosScreen
        data={data}
        onChange={setData}
        onGerar={handleGerar}
        saving={saving}
        saveError={saveError}
      />
    )
  }

  return (
    <PagamentoScreen
      selected={planoId}
      onSelect={setPlanoId}
      onGerarPix={handleGerarPix}
      onNovoPix={handleNovoPix}
      loading={payLoading}
      error={payError}
      statusMsg={payStatus}
      pix={pix}
      awaitingWebhook={awaitingWebhook}
    />
  )
}
