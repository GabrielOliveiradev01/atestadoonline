import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { buscarPorProtocolo } from '../services/atestados'
import type { AtestadoRow } from '../lib/database.types'
import { AtestadoSheet } from './AtestadoSheet'
import { rowToAtestadoData } from '../utils/atestadoMap'
import { downloadPdfFromElement, validacaoUrlFor } from '../utils/gerarPdf'
import './ValidacaoScreen.css'
import './PdfScreen.css'

const TIPO: Record<string, string> = {
  sem_afastamento: 'Atendimento sem afastamento',
  repouso_hoje: 'Repouso hoje',
  afastado_dias: 'Afastamento por dias',
  acompanhando: 'Acompanhando paciente',
  internacao: 'Internação hospitalar',
}

function mascararDoc(doc: string): string {
  const d = doc.replace(/\D/g, '')
  if (d.length < 4) return '***'
  return `***${d.slice(-4)}`
}

export function ValidacaoScreen() {
  const { protocolo = '' } = useParams()
  const decoded = decodeURIComponent(protocolo)
  const sheetRef = useRef<HTMLElement>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [atestado, setAtestado] = useState<AtestadoRow | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [baixando, setBaixando] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setErro(null)
    buscarPorProtocolo(decoded)
      .then((row) => {
        if (alive) setAtestado(row)
      })
      .catch((e: Error) => {
        if (alive) setErro(e.message)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [decoded])

  useEffect(() => {
    if (!atestado) return
    QRCode.toDataURL(validacaoUrlFor(atestado.protocolo), {
      margin: 1,
      width: 160,
      errorCorrectionLevel: 'M',
    }).then(setQrUrl)
  }, [atestado])

  const baixarPdf = async () => {
    if (!sheetRef.current || !atestado) return
    setBaixando(true)
    try {
      await downloadPdfFromElement(
        sheetRef.current,
        `atestado-${atestado.protocolo}.pdf`,
        qrUrl,
      )
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div className="validacao">
      <header className="validacao__hero">
        <p className="validacao__seal">AMA Saúde · Validação de Atestado</p>
        <h1>Resultado da consulta</h1>
        <p className="validacao__lead">
          Protocolo: <strong>{decoded}</strong>
        </p>
      </header>

      {loading && <div className="validacao__card">Consultando banco de dados…</div>}

      {!loading && erro && (
        <div className="validacao__card validacao__card--err">
          Erro ao consultar: {erro}
        </div>
      )}

      {!loading && !erro && !atestado && (
        <div className="validacao__card validacao__card--bad">
          <strong>DOCUMENTO NÃO ENCONTRADO</strong>
          <p>Este protocolo não existe na base oficial.</p>
        </div>
      )}

      {!loading && atestado && (
        <div className="validacao__card validacao__card--ok">
          <strong>DOCUMENTO VÁLIDO</strong>
          <dl className="validacao__facts">
            <div>
              <dt>Paciente</dt>
              <dd>{atestado.paciente_nome}</dd>
            </div>
            <div>
              <dt>Documento</dt>
              <dd>{mascararDoc(atestado.paciente_documento)}</dd>
            </div>
            <div>
              <dt>Unidade</dt>
              <dd>{atestado.unidade_nome}</dd>
            </div>
            <div>
              <dt>Emissão</dt>
              <dd>{atestado.data_emissao}</dd>
            </div>
            <div>
              <dt>Recomendação</dt>
              <dd>{TIPO[atestado.tipo_recomendacao] || atestado.tipo_recomendacao}</dd>
            </div>
            <div>
              <dt>Dias</dt>
              <dd>{atestado.dias_afastamento ?? '—'}</dd>
            </div>
            <div>
              <dt>Profissional</dt>
              <dd>{atestado.profissional_nome}</dd>
            </div>
            <div>
              <dt>CRM</dt>
              <dd>
                {atestado.conselho_uf}-{atestado.conselho_numero}
              </dd>
            </div>
            {atestado.autoriza_cid && (
              <div>
                <dt>C.I.D.</dt>
                <dd>{atestado.cid || atestado.diagnostico || '—'}</dd>
              </div>
            )}
          </dl>
          <p className="validacao__when">
            Consultado em {new Date().toLocaleString('pt-BR')}
          </p>

          <button
            type="button"
            className="validacao__download"
            onClick={baixarPdf}
            disabled={baixando || !qrUrl}
          >
            {baixando ? 'Gerando PDF…' : 'Baixar PDF do atestado'}
          </button>
        </div>
      )}

      <p className="validacao__back">
        <Link to="/">← Voltar</Link>
      </p>

      {atestado && (
        <div className="pdf__offscreen" aria-hidden="true">
          <AtestadoSheet
            ref={sheetRef}
            data={rowToAtestadoData(atestado)}
            qrUrl={qrUrl}
          />
        </div>
      )}
    </div>
  )
}
