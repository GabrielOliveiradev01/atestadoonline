export type PlanoId = '1_dia' | '3_dias'

export type Plano = {
  id: PlanoId
  titulo: string
  descricao: string
  valor: number
  diasAfastamento: string
}

export const PLANOS: Plano[] = [
  {
    id: '1_dia',
    titulo: '1 dia de atestado',
    descricao: 'Afastamento de 1 dia',
    valor: 70,
    diasAfastamento: '1',
  },
  {
    id: '3_dias',
    titulo: '3 dias de atestado',
    descricao: 'Afastamento de 3 dias',
    valor: 90,
    diasAfastamento: '3',
  },
]

export function planoPorId(id: string | null | undefined): Plano | undefined {
  return PLANOS.find((p) => p.id === id)
}

export function formatBrl(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
