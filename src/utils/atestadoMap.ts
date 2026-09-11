import type { AtestadoData, TipoProfissional, TipoRecomendacao } from '../types'
import type { AtestadoRow } from '../lib/database.types'

function s(value: string | null | undefined): string {
  return (value ?? '').trim()
}

export function rowToAtestadoData(row: AtestadoRow): AtestadoData {
  const tipoRec = row.tipo_recomendacao as TipoRecomendacao
  const tipoProf = row.tipo_profissional as TipoProfissional

  return {
    unidadeNome: s(row.unidade_nome),
    unidadeCep: s(row.unidade_cep),
    unidadeTelefone: s(row.unidade_telefone),
    unidadeEndereco: s(row.unidade_endereco),
    unidadeParceiro: s(row.unidade_parceiro),
    pacienteNome: s(row.paciente_nome),
    pacienteDocumento: s(row.paciente_documento),
    dataAtendimentoInicio: s(row.data_atendimento_inicio),
    horaAtendimentoInicio: s(row.hora_atendimento_inicio)?.slice(0, 5),
    dataAtendimentoFim: s(row.data_atendimento_fim),
    horaAtendimentoFim: s(row.hora_atendimento_fim)?.slice(0, 5),
    tipoRecomendacao: tipoRec || 'afastado_dias',
    diasAfastamento: String(row.dias_afastamento ?? 1),
    acompanhanteNome: s(row.acompanhante_nome),
    dataInternacao: s(row.data_internacao),
    cid: s(row.cid),
    diagnostico: s(row.diagnostico),
    autorizaCid: Boolean(row.autoriza_cid),
    dataEmissao: s(row.data_emissao),
    localEmissao: s(row.local_emissao) || 'São Paulo',
    tipoProfissional: tipoProf || 'medico',
    profissionalNome: s(row.profissional_nome),
    conselhoNumero: s(row.conselho_numero),
    conselhoUf: s(row.conselho_uf) || 'SP',
  }
}
