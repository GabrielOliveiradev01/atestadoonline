import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import type { AtestadoData } from '../types'
import { AtestadoSheet } from './AtestadoSheet'
import { buildPdfFromElement, validacaoUrlFor } from '../utils/gerarPdf'
import './PdfScreen.css'

type Props = {
  data: AtestadoData
  protocolo: string
  dbWarning?: string | null
  onVoltar: () => void
}

export function PdfScreen({ data, protocolo, dbWarning = null, onVoltar }: Props) {
  const sheetRef = useRef<HTMLElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pdfUrlRef = useRef<string | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    QRCode.toDataURL(validacaoUrlFor(protocolo), {
      margin: 1,
      width: 160,
      errorCorrectionLevel: 'M',
    }).then(setQrUrl)
  }, [protocolo])

  useEffect(() => {
    if (!qrUrl) return
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!sheetRef.current || cancelled) return
        const pdf = await buildPdfFromElement(sheetRef.current, qrUrl)
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

      <div className="pdf__offscreen" aria-hidden="true">
        <AtestadoSheet ref={sheetRef} data={data} qrUrl={qrUrl} />
      </div>
    </div>
  )
}
