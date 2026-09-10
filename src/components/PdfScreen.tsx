import { useEffect, useRef, useState } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'
import type { AtestadoData } from '../types'
import {
  diasPorExtenso,
  formatDateParts,
  formatHoraCurta,
  padDias,
} from '../utils/format'
import './PdfScreen.css'

type Props = {
  data: AtestadoData
  protocolo: string
  dbWarning?: string | null
  onVoltar: () => void
}

function Blank({ value, min = 8 }: { value?: string; min?: number }) {
  const text = (value || '').trim()
  return (
    <span className={`sheet__fill ${text ? '' : 'is-empty'}`}>
      {text || '_'.repeat(Math.max(min, 4))}
    </span>
  )
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span className={`sheet__radio ${checked ? 'is-on' : ''}`} aria-hidden="true">
      {checked ? '●' : ''}
    </span>
  )
}

export function PdfScreen({ data, protocolo, dbWarning = null, onVoltar }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pdfUrlRef = useRef<string | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dias = Number(data.diasAfastamento) || 1
  const diasStr = padDias(dias)
  const diasExt = diasPorExtenso(dias)
  const emit = formatDateParts(data.dataEmissao)
  const ini = formatDateParts(data.dataAtendimentoInicio)
  const fim = formatDateParts(data.dataAtendimentoFim)
  const intern = formatDateParts(data.dataInternacao)
  const horaAssinatura = data.horaAtendimentoFim || '--:--'
  const tituloProf =
    data.tipoProfissional === 'radiologista' ? 'Médico Radiologista' : 'Médico'

  useEffect(() => {
    window.scrollTo(0, 0)
    const base = (import.meta.env.VITE_VALIDACAO_URL || '').replace(/\/$/, '')
    const validacaoUrl = base
      ? `${base}/atestado/${encodeURIComponent(protocolo)}`
      : `http://localhost:5174/atestado/${encodeURIComponent(protocolo)}`
    QRCode.toDataURL(validacaoUrl, { margin: 1, width: 160, errorCorrectionLevel: 'M' }).then(
      setQrUrl,
    )
  }, [protocolo])

  useEffect(() => {
    if (!qrUrl) return
    let cancelled = false

    const preload = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = src
      })

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([
          preload('/logos/prefeitura-saude.png'),
          preload('/logos/santa-marcelina.png'),
          preload('/logos/sus.png'),
          preload(qrUrl),
        ])
        await new Promise((r) => setTimeout(r, 80))
        if (!sheetRef.current || cancelled) return

        const canvas = await html2canvas(sheetRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })
        const img = canvas.toDataURL('image/png')
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const pageW = pdf.internal.pageSize.getWidth()
        const pageH = pdf.internal.pageSize.getHeight()
        const ratio = Math.min(pageW / canvas.width, pageH / canvas.height)
        const w = canvas.width * ratio
        const h = canvas.height * ratio
        const x = (pageW - w) / 2
        pdf.addImage(img, 'PNG', x, 6, w, Math.min(h, pageH - 12))

        const blob = pdf.output('blob')
        const url = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
        pdfUrlRef.current = url
        setPdfUrl(url)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Falha ao gerar o PDF')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [qrUrl, data, protocolo])

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
    }
  }, [])

  const downloadPdf = () => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = `atestado-${protocolo}.pdf`
    a.click()
  }

  const printPdf = () => {
    const frame = iframeRef.current
    if (!frame?.contentWindow) return
    frame.contentWindow.focus()
    frame.contentWindow.print()
  }

  return (
    <div className="pdf">
      <header className="pdf__toolbar no-print">
        <button type="button" className="pdf__btn pdf__btn--ghost" onClick={onVoltar}>
          ← Voltar aos dados
        </button>
        <div className="pdf__toolbar-actions">
          <button
            type="button"
            className="pdf__btn pdf__btn--ghost"
            onClick={printPdf}
            disabled={!pdfUrl}
          >
            Imprimir
          </button>
          <button
            type="button"
            className="pdf__btn pdf__btn--primary"
            onClick={downloadPdf}
            disabled={!pdfUrl}
          >
            Baixar PDF
          </button>
        </div>
      </header>

      {dbWarning && <p className="pdf__warn no-print">{dbWarning}</p>}

      <div className="pdf__viewer-wrap no-print">
        {loading && <p className="pdf__status">Gerando visualização do PDF…</p>}
        {error && <p className="pdf__status pdf__status--err">{error}</p>}
        {pdfUrl && (
          <iframe
            ref={iframeRef}
            className="pdf__viewer"
            title={`Atestado ${protocolo}`}
            src={pdfUrl}
          />
        )}
      </div>

      {/* Folha oculta só para montar o PDF */}
      <div className="pdf__offscreen" aria-hidden="true">
        <article className="sheet" ref={sheetRef} id="atestado-sheet">
          <header className="sheet__header">
            <img
              className="sheet__logo-img sheet__logo-img--pref"
              src="/logos/prefeitura-saude.png"
              alt="Cidade de São Paulo — Saúde"
            />

            <div className="sheet__header-center">
              <p>Prefeitura da Cidade de São Paulo</p>
              <p>Secretaria Municipal da Saúde</p>
              <p className="sheet__unidade">{data.unidadeNome}</p>
              <p className="sheet__unidade-meta">
                CEP: {data.unidadeCep}
                {data.unidadeTelefone ? ` - Telefone: ${data.unidadeTelefone}` : ''}
              </p>
              <p className="sheet__unidade-meta">{data.unidadeEndereco}</p>
            </div>

            <div className="sheet__logos-right">
              <img
                className="sheet__logo-img sheet__logo-img--parceiro"
                src="/logos/santa-marcelina.png"
                alt="Santa Marcelina Saúde"
              />
              <img
                className="sheet__logo-img sheet__logo-img--sus"
                src="/logos/sus.png"
                alt="SUS"
              />
            </div>
          </header>

          <h1 className="sheet__title">ATESTADO MÉDICO</h1>

          <p className="sheet__p">
            Atesto que o(a) paciente: <Blank value={data.pacienteNome} min={42} />
          </p>

          <p className="sheet__p">
            portador(a) de <Blank value={data.pacienteDocumento} min={16} />, necessita de{' '}
            <Blank value={diasStr} min={3} /> ( <Blank value={diasExt} min={6} /> ) dias de
            afastamento do trabalho a partir desta data por motivo de doença.
          </p>

          <p className="sheet__p">
            Esteve neste serviço de saúde dia{' '}
            <Blank value={ini.d} min={2} /> / <Blank value={ini.m} min={2} /> /{' '}
            <Blank value={ini.y} min={4} /> das <Blank value={data.horaAtendimentoInicio} min={5} />{' '}
            às <Blank value={data.horaAtendimentoFim} min={5} /> hs até o dia{' '}
            <Blank value={fim.d} min={2} /> / <Blank value={fim.m} min={2} /> /{' '}
            <Blank value={fim.y} min={4} /> das <Blank value={data.horaAtendimentoInicio} min={5} />{' '}
            às <Blank value={data.horaAtendimentoFim} min={5} /> hs.
          </p>

          <ul className="sheet__options">
            <li>
              <Radio checked={data.tipoRecomendacao === 'sem_afastamento'} />
              <span>Para atendimento sem afastamento</span>
            </li>
            <li>
              <Radio checked={data.tipoRecomendacao === 'repouso_hoje'} />
              <span>Para atendimento, devendo permanecer em repouso hoje</span>
            </li>
            <li>
              <Radio checked={data.tipoRecomendacao === 'afastado_dias'} />
              <span>
                Para atendimento, devendo permanecer afastado por{' '}
                <Blank value={data.tipoRecomendacao === 'afastado_dias' ? diasStr : ''} min={3} />{' '}
                dias a partir desta data.
              </span>
            </li>
            <li>
              <Radio checked={data.tipoRecomendacao === 'acompanhando'} />
              <span>
                Acompanhando o paciente{' '}
                <Blank
                  value={data.tipoRecomendacao === 'acompanhando' ? data.acompanhanteNome : ''}
                  min={28}
                />
              </span>
            </li>
            <li>
              <Radio checked={data.tipoRecomendacao === 'internacao'} />
              <span>
                Em internação hospitalar desde o dia{' '}
                <Blank value={data.tipoRecomendacao === 'internacao' ? intern.d : ''} min={2} /> /{' '}
                <Blank value={data.tipoRecomendacao === 'internacao' ? intern.m : ''} min={2} /> /{' '}
                <Blank value={data.tipoRecomendacao === 'internacao' ? intern.y : ''} min={4} />.
              </span>
            </li>
          </ul>

          <p className="sheet__p sheet__cid">
            (C.I.D) <Blank value={data.autorizaCid ? data.cid : ''} min={8} /> ou diagnóstico:{' '}
            <Blank value={data.autorizaCid ? data.diagnostico : ''} min={28} />
          </p>

          <p className="sheet__local">
            {data.localEmissao || 'São Paulo'}, <Blank value={emit.d} min={2} /> /{' '}
            <Blank value={emit.m} min={2} /> / <Blank value={emit.y} min={4} />
          </p>

          <div className="sheet__assinatura-block">
            <div className="sheet__qr-col">
              {qrUrl ? (
                <img src={qrUrl} alt="" className="sheet__qr" />
              ) : (
                <div className="sheet__qr sheet__qr--placeholder" />
              )}
            </div>
            <div className="sheet__sign-col">
              <div className="sheet__carimbo">
                <strong>
                  Dr(a). {data.profissionalNome || '—'}
                </strong>
                <span>
                  {tituloProf} — CRM/{data.conselhoUf} {data.conselhoNumero || '—'}
                </span>
              </div>
              <p className="sheet__digital">
                Documento assinado digitalmente nos termos da lei 11.419/2006{' '}
                <strong>{data.profissionalNome || '—'}</strong> em{' '}
                {formatHoraCurta(data.dataEmissao, horaAssinatura)}
              </p>
              <p className="sheet__digital-id">
                {data.profissionalNome || '—'} / {data.conselhoNumero || '—'}
              </p>
              <div className="sheet__sign-line" />
              <p className="sheet__sign-label">
                Assinatura e carimbo do Médico ou Odontólogo / (CRM - CRO)
              </p>
            </div>
          </div>

          <footer className="sheet__footer">
            <div className="sheet__footer-left">
              <span className={`sheet__check ${data.autorizaCid ? 'is-on' : ''}`}>
                {data.autorizaCid ? '☑' : '☐'}
              </span>
              <span>Autorizo divulgação do C.I.D. ou diagnóstico</span>
            </div>
            <div className="sheet__footer-right">
              <div className="sheet__sign-line sheet__sign-line--paciente" />
              <p className="sheet__sign-label">Assinatura do paciente</p>
            </div>
          </footer>
        </article>
      </div>
    </div>
  )
}
