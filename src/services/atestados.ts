import type { AtestadoData } from '../types'
import { generateProtocolo } from '../utils/format'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { AtestadoInsert, AtestadoRow } from '../lib/database.types'

function toNull(value: string): string | null {
  const v = value.trim()
  return v ? v : null
}

function toInsert(data: AtestadoData, protocolo: string): AtestadoInsert {
  return {
    protocolo,
    unidade_nome: data.unidadeNome.trim(),
    unidade_cep: toNull(data.unidadeCep),
    unidade_telefone: toNull(data.unidadeTelefone),
    unidade_endereco: toNull(data.unidadeEndereco),
    unidade_parceiro: toNull(data.unidadeParceiro),
    paciente_nome: data.pacienteNome.trim(),
    paciente_documento: data.pacienteDocumento.trim(),
    data_atendimento_inicio: toNull(data.dataAtendimentoInicio),
    hora_atendimento_inicio: toNull(data.horaAtendimentoInicio),
    data_atendimento_fim: toNull(data.dataAtendimentoFim),
    hora_atendimento_fim: toNull(data.horaAtendimentoFim),
    tipo_recomendacao: data.tipoRecomendacao,
    dias_afastamento: Number(data.diasAfastamento) || 1,
    acompanhante_nome: toNull(data.acompanhanteNome),
    data_internacao: toNull(data.dataInternacao),
    cid: toNull(data.cid),
    diagnostico: toNull(data.diagnostico),
    autoriza_cid: data.autorizaCid,
    data_emissao: data.dataEmissao,
    local_emissao: toNull(data.localEmissao),
    tipo_profissional: data.tipoProfissional,
    profissional_nome: data.profissionalNome.trim(),
    conselho_numero: data.conselhoNumero.trim(),
    conselho_uf: data.conselhoUf,
  }
}

export type SaveResult = {
  ok: boolean
  protocolo: string
  row?: AtestadoRow
  offline?: boolean
  error?: string
}

export async function salvarAtestado(data: AtestadoData): Promise<SaveResult> {
  const protocolo = generateProtocolo()

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: true,
      protocolo,
      offline: true,
      error: 'Supabase não configurado. Atestado gerado só localmente.',
    }
  }

  const payload = toInsert(data, protocolo)
  const { data: row, error } = await supabase
    .from('atestados')
    .insert(payload)
    .select()
    .single()

  if (error) {
    return {
      ok: false,
      protocolo,
      error: error.message,
    }
  }

  return { ok: true, protocolo, row: row as AtestadoRow }
}

export async function buscarPorProtocolo(protocolo: string): Promise<AtestadoRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('atestados')
    .select('*')
    .eq('protocolo', protocolo)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as AtestadoRow | null
}
