import type { FormEvent } from 'react'
import type { AtestadoData } from '../types'
import { UFS } from '../types'
import { formatCpf } from '../utils/format'
import './DadosScreen.css'

type Props = {
  data: AtestadoData
  onChange: (data: AtestadoData) => void
  onGerar: () => void
}

export function DadosScreen({ data, onChange, onGerar }: Props) {
  const set = <K extends keyof AtestadoData>(key: K, value: AtestadoData[K]) => {
    onChange({ ...data, [key]: value })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onGerar()
  }

  const conselhoLabel =
    data.tipoProfissional === 'medico' ? 'CRM' : 'CRM (Radiologista)'

  return (
    <div className="dados">
      <header className="dados__hero">
        <div className="dados__hero-bg" aria-hidden="true" />
        <div className="dados__hero-inner">
          <p className="dados__seal">República Federativa do Brasil</p>
          <h1 className="dados__brand">Atestado Online</h1>
          <p className="dados__lead">
            Emissão oficial de atestado médico para médicos e radiologistas,
            conforme normas do Conselho Federal de Medicina.
          </p>
        </div>
      </header>

      <main className="dados__main">
        <form className="dados__form" onSubmit={handleSubmit} noValidate>
          <section className="dados__section">
            <h2>Dados do paciente</h2>
            <div className="dados__grid">
              <label className="dados__field dados__field--full">
                <span>Nome completo</span>
                <input
                  required
                  value={data.pacienteNome}
                  onChange={(e) => set('pacienteNome', e.target.value)}
                  placeholder="Nome completo do paciente"
                  autoComplete="name"
                />
              </label>
              <label className="dados__field">
                <span>CPF</span>
                <input
                  required
                  value={data.pacienteCpf}
                  onChange={(e) => set('pacienteCpf', formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
              </label>
              <label className="dados__field">
                <span>RG</span>
                <input
                  value={data.pacienteRg}
                  onChange={(e) => set('pacienteRg', e.target.value)}
                  placeholder="Opcional"
                />
              </label>
              <label className="dados__field">
                <span>Data de nascimento</span>
                <input
                  type="date"
                  value={data.pacienteNascimento}
                  onChange={(e) => set('pacienteNascimento', e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="dados__section">
            <h2>Dados do atestado</h2>
            <div className="dados__grid">
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
              <label className="dados__field">
                <span>Início do afastamento</span>
                <input
                  required
                  type="date"
                  value={data.dataInicio}
                  onChange={(e) => set('dataInicio', e.target.value)}
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
              <label className="dados__field">
                <span>Local de emissão</span>
                <input
                  required
                  value={data.localEmissao}
                  onChange={(e) => set('localEmissao', e.target.value)}
                  placeholder="Cidade / Município"
                />
              </label>
              <label className="dados__field dados__field--full dados__check">
                <input
                  type="checkbox"
                  checked={data.incluirCid}
                  onChange={(e) => set('incluirCid', e.target.checked)}
                />
                <span>Incluir CID no atestado (somente com autorização do paciente)</span>
              </label>
              {data.incluirCid && (
                <label className="dados__field">
                  <span>CID-10</span>
                  <input
                    value={data.cid}
                    onChange={(e) => set('cid', e.target.value.toUpperCase())}
                    placeholder="Ex.: J06.9"
                  />
                </label>
              )}
              <label className="dados__field dados__field--full">
                <span>Observações</span>
                <textarea
                  rows={3}
                  value={data.observacoes}
                  onChange={(e) => set('observacoes', e.target.value)}
                  placeholder="Informações complementares (opcional)"
                />
              </label>
            </div>
          </section>

          <section className="dados__section">
            <h2>Profissional responsável</h2>
            <div className="dados__tipo">
              <button
                type="button"
                className={
                  data.tipoProfissional === 'medico'
                    ? 'dados__tipo-btn is-active'
                    : 'dados__tipo-btn'
                }
                onClick={() => {
                  onChange({
                    ...data,
                    tipoProfissional: 'medico',
                    especialidade: data.especialidade || 'Clínica Geral',
                  })
                }}
              >
                Médico
              </button>
              <button
                type="button"
                className={
                  data.tipoProfissional === 'radiologista'
                    ? 'dados__tipo-btn is-active'
                    : 'dados__tipo-btn'
                }
                onClick={() => {
                  onChange({
                    ...data,
                    tipoProfissional: 'radiologista',
                    especialidade: 'Radiologia e Diagnóstico por Imagem',
                  })
                }}
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
                  onChange={(e) => set('profissionalNome', e.target.value)}
                  placeholder="Nome completo"
                />
              </label>
              <label className="dados__field">
                <span>{conselhoLabel}</span>
                <input
                  required
                  value={data.conselhoNumero}
                  onChange={(e) => set('conselhoNumero', e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="Número"
                  inputMode="numeric"
                />
              </label>
              <label className="dados__field">
                <span>UF do conselho</span>
                <select
                  required
                  value={data.conselhoUf}
                  onChange={(e) => set('conselhoUf', e.target.value)}
                >
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </label>
              <label className="dados__field">
                <span>Especialidade</span>
                <input
                  required
                  value={data.especialidade}
                  onChange={(e) => set('especialidade', e.target.value)}
                  placeholder="Especialidade"
                />
              </label>
              <label className="dados__field dados__field--full">
                <span>Unidade de saúde / Clínica</span>
                <input
                  value={data.unidadeSaude}
                  onChange={(e) => set('unidadeSaude', e.target.value)}
                  placeholder="Nome da unidade (opcional)"
                />
              </label>
            </div>
          </section>

          <div className="dados__actions">
            <button type="submit" className="dados__submit">
              Gerar atestado PDF
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
