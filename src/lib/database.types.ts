export type AtestadoRow = {
  id: string
  protocolo: string
  unidade_nome: string
  unidade_cep: string | null
  unidade_telefone: string | null
  unidade_endereco: string | null
  unidade_parceiro: string | null
  paciente_nome: string
  paciente_documento: string
  data_atendimento_inicio: string | null
  hora_atendimento_inicio: string | null
  data_atendimento_fim: string | null
  hora_atendimento_fim: string | null
  tipo_recomendacao: string
  dias_afastamento: number | null
  acompanhante_nome: string | null
  data_internacao: string | null
  cid: string | null
  diagnostico: string | null
  autoriza_cid: boolean
  data_emissao: string
  local_emissao: string | null
  tipo_profissional: string
  profissional_nome: string
  conselho_numero: string
  conselho_uf: string
  created_at: string
}

export type AtestadoInsert = Omit<AtestadoRow, 'id' | 'created_at'>

export type Database = {
  public: {
    Tables: {
      atestados: {
        Row: AtestadoRow
        Insert: AtestadoInsert
        Update: Partial<AtestadoInsert>
      }
    }
  }
}
