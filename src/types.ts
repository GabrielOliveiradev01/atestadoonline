export type TipoProfissional = 'medico' | 'radiologista'

export type TipoRecomendacao =
  | 'sem_afastamento'
  | 'repouso_hoje'
  | 'afastado_dias'
  | 'acompanhando'
  | 'internacao'

export type AtestadoData = {
  // Unidade
  unidadeNome: string
  unidadeCep: string
  unidadeTelefone: string
  unidadeEndereco: string
  unidadeParceiro: string

  // Paciente
  pacienteNome: string
  pacienteDocumento: string

  // Atendimento
  dataAtendimentoInicio: string
  horaAtendimentoInicio: string
  dataAtendimentoFim: string
  horaAtendimentoFim: string

  // Recomendação
  tipoRecomendacao: TipoRecomendacao
  diasAfastamento: string
  acompanhanteNome: string
  dataInternacao: string

  // Diagnóstico
  cid: string
  diagnostico: string
  autorizaCid: boolean

  // Emissão
  dataEmissao: string
  localEmissao: string

  // Profissional
  tipoProfissional: TipoProfissional
  profissionalNome: string
  conselhoNumero: string
  conselhoUf: string
}

export const emptyAtestado = (): AtestadoData => {
  const hoje = new Date().toISOString().slice(0, 10)
  const agora = new Date()
  const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`

  return {
    unidadeNome: 'AMA 24H JOSE BONIFACIO III',
    unidadeCep: '08250650',
    unidadeTelefone: '(11) 2055-4462',
    unidadeEndereco: 'RUA SILVIO BARBINI, n° 40, SAO PAULO - SP',
    unidadeParceiro: 'SANTA MARCELINA Saúde',

    pacienteNome: '',
    pacienteDocumento: '',

    dataAtendimentoInicio: hoje,
    horaAtendimentoInicio: hora,
    dataAtendimentoFim: hoje,
    horaAtendimentoFim: hora,

    tipoRecomendacao: 'afastado_dias',
    diasAfastamento: '1',
    acompanhanteNome: '',
    dataInternacao: '',

    cid: '',
    diagnostico: '',
    autorizaCid: true,

    dataEmissao: hoje,
    localEmissao: 'São Paulo',

    tipoProfissional: 'medico',
    profissionalNome: '',
    conselhoNumero: '',
    conselhoUf: 'SP',
  }
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const
