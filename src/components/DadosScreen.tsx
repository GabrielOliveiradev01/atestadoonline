import type { FormEvent } from 'react'
import type { AtestadoData, TipoRecomendacao } from '../types'
import { UFS } from '../types'
import { onlyDigits } from '../utils/format'
import './DadosScreen.css'

type Props = {
  data: AtestadoData
  onChange: (data: AtestadoData) => void
  onGerar: () => void
  saving?: boolean
  saveError?: string | null
  dbReady?: boolean
}

const RECOMENDACOES: { value: TipoRecomendacao; label: string }[] = [
  { value: 'sem_afastamento', label: 'Para atendimento sem afastamento' },
  { value: 'repouso_hoje', label: 'Para atendimento, devendo permanecer em repouso hoje' },
  { value: 'afastado_dias', label: 'Para atendimento, devendo permanecer afastado por X dias' },
  { value: 'acompanhando', label: 'Acompanhando o paciente' },
  { value: 'internacao', label: 'Em internação hospitalar' },
]

export function DadosScreen({
  data,
  onChange,
  onGerar,
  saving = false,
  saveError = null,
  dbReady = false,
}: Props) {
  const set = <K extends keyof AtestadoData>(key: K, value: AtestadoData[K]) => {
    onChange({ ...data, [key]: value })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!saving) onGerar()
  }

  return (
    <div className="dados">
      <header className="dados__hero">
        <div className="dados__hero-bg" aria-hidden="true" />
        <div className="dados__hero-inner">
          <p className="dados__seal">Prefeitura da Cidade de São Paulo · SMS</p>
          <h1 className="dados__brand">Atestado Online</h1>
          <p className="dados__lead">
            Preencha os dados para emitir o atestado no modelo oficial da
            Secretaria Municipal da Saúde.
          </p>
          <p className={`dados__db ${dbReady ? 'is-ok' : 'is-warn'}`}>
            {dbReady
              ? 'Banco de dados conectado (Supabase)'
              : 'Banco offline — configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env'}
          </p>
        </div>
      </header>

      <main className="dados__main">
        <form className="dados__form" onSubmit={handleSubmit} noValidate>
          <section className="dados__section">
            <h2>Unidade de saúde</h2>
            <div className="dados__grid">
              <label className="dados__field dados__field--full">
                <span>Nome da unidade</span>
                <input
                  required
                  value={data.unidadeNome}
                  onChange={(e) => set('unidadeNome', e.target.value.toUpperCase())}
                />
              </label>
              <label className="dados__field">
                <span>CEP</span>
                <input
                  value={data.unidadeCep}
                  onChange={(e) => set('unidadeCep', onlyDigits(e.target.value, 8))}
                />
              </label>
              <label className="dados__field">
                <span>Telefone</span>
                <input
                  value={data.unidadeTelefone}
                  onChange={(e) => set('unidadeTelefone', e.target.value)}
                />
              </label>
              <label className="dados__field dados__field--full">
                <span>Endereço</span>
                <input
                  value={data.unidadeEndereco}
                  onChange={(e) => set('unidadeEndereco', e.target.value)}
                />
              </label>
              <label className="dados__field dados__field--full">
                <span>Parceiro / gestão</span>
                <input
                  value={data.unidadeParceiro}
                  onChange={(e) => set('unidadeParceiro', e.target.value)}
                  placeholder="Ex.: SANTA MARCELINA Saúde"
                />
              </label>
            </div>
          </section>

          <section className="dados__section">
            <h2>Dados do paciente</h2>
            <div className="dados__grid">
              <label className="dados__field dados__field--full">
                <span>Nome completo</span>
                <input
                  required
                  value={data.pacienteNome}
                  onChange={(e) => set('pacienteNome', e.target.value.toUpperCase())}
                  placeholder="NOME COMPLETO"
                  autoComplete="name"
                />
              </label>
              <label className="dados__field dados__field--full">
                <span>Documento (CPF / CNS)</span>
                <input
                  required
                  value={data.pacienteDocumento}
                  onChange={(e) => set('pacienteDocumento', onlyDigits(e.target.value, 15))}
                  placeholder="Somente números"
                  inputMode="numeric"
                />
              </label>
            </div>
          </section>

          <section className="dados__section">
            <h2>Atendimento</h2>
            <div className="dados__grid">
              <label className="dados__field">
                <span>Data início</span>
                <input
                  required
                  type="date"
                  value={data.dataAtendimentoInicio}
                  onChange={(e) => set('dataAtendimentoInicio', e.target.value)}
                />
              </label>
              <label className="dados__field">
                <span>Hora início</span>
                <input
                  required
                  type="time"
                  value={data.horaAtendimentoInicio}
                  onChange={(e) => set('horaAtendimentoInicio', e.target.value)}
                />
              </label>
              <label className="dados__field">
                <span>Data fim</span>
                <input
                  required
                  type="date"
                  value={data.dataAtendimentoFim}
                  onChange={(e) => set('dataAtendimentoFim', e.target.value)}
                />
              </label>
              <label className="dados__field">
                <span>Hora fim</span>
                <input
                  required
                  type="time"
                  value={data.horaAtendimentoFim}
                  onChange={(e) => set('horaAtendimentoFim', e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="dados__section">
            <h2>Tipo de recomendação</h2>
            <div className="dados__radios">
              {RECOMENDACOES.map((opt) => (
                <label key={opt.value} className="dados__radio">
                  <input
                    type="radio"
                    name="recomendacao"
                    checked={data.tipoRecomendacao === opt.value}
                    onChange={() => set('tipoRecomendacao', opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="dados__grid" style={{ marginTop: '1rem' }}>
              {data.tipoRecomendacao === 'afastado_dias' && (
                <label className="dados__field">
                  <span>Dias de afastamento</span>
                  <input
                    required
                    type="number"
                    min={1}
                    max={365}
                    value={data.diasAfastamento}
                    onChange={(e) => set('diasAfastamento', e.target.value)}
                  />
                </label>
              )}
              {data.tipoRecomendacao === 'acompanhando' && (
                <label className="dados__field dados__field--full">
                  <span>Nome do paciente acompanhado</span>
                  <input
                    required
                    value={data.acompanhanteNome}
                    onChange={(e) => set('acompanhanteNome', e.target.value.toUpperCase())}
                  />
                </label>
              )}
              {data.tipoRecomendacao === 'internacao' && (
                <label className="dados__field">
                  <span>Internação desde</span>
                  <input
                    required
                    type="date"
                    value={data.dataInternacao}
                    onChange={(e) => set('dataInternacao', e.target.value)}
                  />
                </label>
              )}
            </div>
          </section>

          <section className="dados__section">
            <h2>Diagnóstico</h2>
            <div className="dados__grid">
              <label className="dados__field">
                <span>C.I.D.</span>
                <input
                  value={data.cid}
                  onChange={(e) => set('cid', e.target.value.toUpperCase().replace(/[^A-Z0-9.]/g, ''))}
                  placeholder="Ex.: M545"
                />
              </label>
              <label className="dados__field">
                <span>ou diagnóstico</span>
                <input
                  value={data.diagnostico}
                  onChange={(e) => set('diagnostico', e.target.value)}
                  placeholder="Texto do diagnóstico"
                />
              </label>
              <label className="dados__field dados__field--full dados__check">
                <input
                  type="checkbox"
                  checked={data.autorizaCid}
                  onChange={(e) => set('autorizaCid', e.target.checked)}
                />
                <span>Autorizo divulgação do C.I.D. ou diagnóstico</span>
              </label>
            </div>
          </section>

          <section className="dados__section">
            <h2>Profissional responsável</h2>
            <div className="dados__tipo">
              <button
                type="button"
                className={data.tipoProfissional === 'medico' ? 'dados__tipo-btn is-active' : 'dados__tipo-btn'}
                onClick={() => set('tipoProfissional', 'medico')}
              >
                Médico
              </button>
              <button
                type="button"
                className={data.tipoProfissional === 'radiologista' ? 'dados__tipo-btn is-active' : 'dados__tipo-btn'}
                onClick={() => set('tipoProfissional', 'radiologista')}
              >
                Radiologista
              </button>
            </div>
            <div className="dados__grid">
              <label className="dados__field dados__field--full">
                <span>Nome do profissional</span>
                <input
                  required
                  value={data.profissionalNome}
                  onChange={(e) => set('profissionalNome', e.target.value.toUpperCase())}
                  placeholder="NOME COMPLETO"
                />
              </label>
              <label className="dados__field">
                <span>CRM</span>
                <input
                  required
                  value={data.conselhoNumero}
                  onChange={(e) => set('conselhoNumero', onlyDigits(e.target.value, 8))}
                  placeholder="Número"
                  inputMode="numeric"
                />
              </label>
              <label className="dados__field">
                <span>UF</span>
                <select
                  required
                  value={data.conselhoUf}
                  onChange={(e) => set('conselhoUf', e.target.value)}
                >
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </label>
              <label className="dados__field">
                <span>Local</span>
                <input
                  required
                  value={data.localEmissao}
                  onChange={(e) => set('localEmissao', e.target.value)}
                />
              </label>
              <label className="dados__field">
                <span>Data de emissão</span>
                <input
                  required
                  type="date"
                  value={data.dataEmissao}
                  onChange={(e) => set('dataEmissao', e.target.value)}
                />
              </label>
            </div>
          </section>

          {saveError && <p className="dados__error">{saveError}</p>}

          <div className="dados__actions">
            <button type="submit" className="dados__submit" disabled={saving}>
              {saving ? 'Salvando no banco…' : 'Visualizar PDF'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
