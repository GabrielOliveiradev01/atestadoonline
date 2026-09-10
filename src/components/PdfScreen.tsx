import { useEffect, useRef, useState } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import type { AtestadoData } from '../types'
import { diasPorExtenso, formatDateBr, generateProtocolo } from '../utils/format'
import './PdfScreen.css'

type Props = {
  data: AtestadoData
  onVoltar: () => void
}

export function PdfScreen({ data, onVoltar }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [protocolo] = useState(() => generateProtocolo())
  const [busy, setBusy] = useState(false)

  const dias = Number(data.diasAfastamento) || 1
  const conselho =
    data.tipoProfissional === 'medico' ? 'CRM' : 'CRM'
  const tipoLabel =
    data.tipoProfissional === 'medico' ? 'Médico(a)' : 'Médico(a) Radiologista'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const downloadPdf = async () => {
    if (!sheetRef.current) return
    setBusy(true)
    try {
      const canvas = await html2canvas(sheetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      const img = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const ratio = Math.min(pageW / canvas.width, pageH / canvas.height)
      const w = canvas.width * ratio
      const h = canvas.height * ratio
      const x = (pageW - w) / 2
      const y = 8
      pdf.addImage(img, 'PNG', x, y, w, Math.min(h, pageH - 16))
      pdf.save(`atestado-${protocolo}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  const printPdf = () => {
    window.print()
  }

  return (
    <div className="pdf">
      <header className="pdf__toolbar no-print">
        <button type="button" className="pdf__btn pdf__btn--ghost" onClick={onVoltar}>
          ← Voltar aos dados
        </button>
        <div className="pdf__toolbar-actions">
          <button type="button" className="pdf__btn pdf__btn--ghost" onClick={printPdf}>
            Imprimir
          </button>
          <button
            type="button"
            className="pdf__btn pdf__btn--primary"
            onClick={downloadPdf}
            disabled={busy}
          >
            {busy ? 'Gerando…' : 'Baixar PDF'}
          </button>
        </div>
      </header>

      <div className="pdf__stage">
        <article className="pdf__sheet" ref={sheetRef} id="atestado-sheet">
          <div className="pdf__gov-bar">
            <div className="pdf__brasao" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="48" height="48">
                <circle cx="32" cy="32" r="30" fill="#0a5c4a" />
                <circle cx="32" cy="32" r="24" fill="none" stroke="#e8c547" strokeWidth="2" />
                <path
                  d="M32 14 L38 28 H52 L40 36 L45 50 L32 41 L19 50 L24 36 L12 28 H26 Z"
                  fill="#e8c547"
                />
              </svg>
            </div>
            <div className="pdf__gov-text">
              <p>República Federativa do Brasil</p>
              <p>Sistema de Emissão de Atestado Médico</p>
              <strong>Atestado Online — Documento Oficial</strong>
            </div>
            <div className="pdf__protocolo">
              <span>Protocolo</span>
              <strong>{protocolo}</strong>
            </div>
          </div>

          <h1 className="pdf__title">Atestado Médico</h1>

          {data.unidadeSaude && (
            <p className="pdf__unidade">{data.unidadeSaude}</p>
          )}

          <p className="pdf__body">
            Atesto, para os devidos fins, que o(a) paciente{' '}
            <strong>{data.pacienteNome || '—'}</strong>, portador(a) do CPF{' '}
            <strong>{data.pacienteCpf || '—'}</strong>
            {data.pacienteRg ? (
              <>
                {' '}e RG <strong>{data.pacienteRg}</strong>
              </>
            ) : null}
            {data.pacienteNascimento ? (
              <>
                , nascido(a) em{' '}
                <strong>{formatDateBr(data.pacienteNascimento)}</strong>
              </>
            ) : null}
            , esteve sob meus cuidados profissionais e necessita de afastamento
            de suas atividades por{' '}
            <strong>
              {dias} ({diasPorExtenso(dias)}) {dias === 1 ? 'dia' : 'dias'}
            </strong>
            , a partir de <strong>{formatDateBr(data.dataInicio)}</strong>.
          </p>

          {data.incluirCid && data.cid && (
            <p className="pdf__cid">
              Código Internacional de Doenças (CID-10): <strong>{data.cid}</strong>
              <em> — informado com autorização do paciente.</em>
            </p>
          )}

          {data.observacoes && (
            <p className="pdf__obs">
              <strong>Observações:</strong> {data.observacoes}
            </p>
          )}

          <p className="pdf__local">
            {data.localEmissao || '—'}, {formatDateBr(data.dataEmissao)}.
          </p>

          <div className="pdf__signature">
            <div className="pdf__sign-line" />
            <p className="pdf__sign-name">{data.profissionalNome || '—'}</p>
            <p className="pdf__sign-meta">
              {tipoLabel} — {data.especialidade || '—'}
            </p>
            <p className="pdf__sign-meta">
              {conselho}/{data.conselhoUf} {data.conselhoNumero || '—'}
            </p>
          </div>

          <footer className="pdf__footer">
            <p>
              Documento emitido eletronicamente. Validade conforme Resolução CFM
              nº 2.299/2021 e normas vigentes. A autenticidade pode ser conferida
              pelo protocolo <strong>{protocolo}</strong>.
            </p>
            <div className="pdf__qr" aria-hidden="true">
              <div className="pdf__qr-box" />
              <span>Validação GOV</span>
            </div>
          </footer>
        </article>
      </div>
    </div>
  )
}
