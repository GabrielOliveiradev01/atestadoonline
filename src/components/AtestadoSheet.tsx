import { forwardRef } from 'react'
import type { AtestadoData } from '../types'
import {
  diasPorExtenso,
  formatDateParts,
  formatHoraCurta,
  padDias,
} from '../utils/format'
import './PdfScreen.css'

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

type Props = {
  data: AtestadoData
  qrUrl: string
}

export const AtestadoSheet = forwardRef<HTMLElement, Props>(function AtestadoSheet(
  { data, qrUrl },
  ref,
) {
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

  return (
    <article className="sheet" ref={ref}>
      <header className="sheet__header">
        <div className="sheet__header-logos">
          <img
            className="sheet__logo-img sheet__logo-img--pref"
            src="/logos/prefeitura-saude.png"
            alt="Cidade de São Paulo — Saúde"
          />
          <div className="sheet__header-titles">
            <p>Prefeitura da Cidade de São Paulo</p>
            <p>Secretaria Municipal da Saúde</p>
          </div>
          <img
            className="sheet__logo-img sheet__logo-img--parceiro"
            src="/logos/santa-marcelina.png"
            alt="Santa Marcelina Saúde"
          />
          <img className="sheet__logo-img sheet__logo-img--sus" src="/logos/sus.png" alt="SUS" />
        </div>
        <div className="sheet__unidade-block">
          <p className="sheet__unidade">{data.unidadeNome}</p>
          <p className="sheet__unidade-meta">
            CEP: {data.unidadeCep}
            {data.unidadeTelefone ? ` - Telefone: ${data.unidadeTelefone}` : ''}
          </p>
          <p className="sheet__unidade-meta">{data.unidadeEndereco}</p>
        </div>
      </header>

      <h1 className="sheet__title">ATESTADO MÉDICO</h1>

      <p className="sheet__p">
        Atesto que o(a) paciente: <Blank value={data.pacienteNome} min={42} />
      </p>

      <p className="sheet__p">
        portador(a) de <Blank value={data.pacienteDocumento} min={16} />, necessita de{' '}
        <Blank value={diasStr} min={3} /> ( <Blank value={diasExt} min={6} /> ) dias de afastamento
        do trabalho a partir desta data por motivo de doença.
      </p>

      <p className="sheet__p">
        Esteve neste serviço de saúde dia <Blank value={ini.d} min={2} /> /{' '}
        <Blank value={ini.m} min={2} /> / <Blank value={ini.y} min={4} /> das{' '}
        <Blank value={data.horaAtendimentoInicio} min={5} /> às{' '}
        <Blank value={data.horaAtendimentoFim} min={5} /> hs até o dia{' '}
        <Blank value={fim.d} min={2} /> / <Blank value={fim.m} min={2} /> /{' '}
        <Blank value={fim.y} min={4} /> das <Blank value={data.horaAtendimentoInicio} min={5} /> às{' '}
        <Blank value={data.horaAtendimentoFim} min={5} /> hs.
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
            <Blank value={data.tipoRecomendacao === 'afastado_dias' ? diasStr : ''} min={3} /> dias
            a partir desta data.
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
            <strong>Dr(a). {data.profissionalNome || '—'}</strong>
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
  )
})
