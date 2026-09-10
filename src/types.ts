export type TipoProfissional = 'medico' | 'radiologista'

export type AtestadoData = {
  // Paciente
  pacienteNome: string
  pacienteCpf: string
  pacienteRg: string
  pacienteNascimento: string

  // Atestado
  diasAfastamento: string
  dataInicio: string
  dataEmissao: string
  cid: string
  incluirCid: boolean
  observacoes: string
  localEmissao: string

  // Profissional
  tipoProfissional: TipoProfissional
  profissionalNome: string
  conselhoNumero: string
  conselhoUf: string
  especialidade: string
  unidadeSaude: string
}

export const emptyAtestado = (): AtestadoData => ({
  pacienteNome: '',
  pacienteCpf: '',
  pacienteRg: '',
  pacienteNascimento: '',
  diasAfastamento: '1',
  dataInicio: new Date().toISOString().slice(0, 10),
  dataEmissao: new Date().toISOString().slice(0, 10),
  cid: '',
  incluirCid: false,
  observacoes: '',
  localEmissao: '',
  tipoProfissional: 'medico',
  profissionalNome: '',
  conselhoNumero: '',
  conselhoUf: 'SP',
  especialidade: '',
  unidadeSaude: '',
})

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const
