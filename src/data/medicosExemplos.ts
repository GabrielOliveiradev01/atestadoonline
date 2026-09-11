export type MedicoExemplo = {
  nome: string
  crm: string
  uf: string
}

/** Médicos para seleção rápida (CRM sem pontuação no formulário). */
export const MEDICOS_EXEMPLOS: MedicoExemplo[] = [
  { nome: 'Camila Felix Rossi', crm: '277239', uf: 'SP' },
  { nome: 'Alexandre Terruggi Junior', crm: '61331', uf: 'SP' },
  { nome: 'Fernando Campos Moraes Amato', crm: '133826', uf: 'SP' },
  { nome: 'Vitor Gabriel Lopes da Silva', crm: '278127', uf: 'SP' },
  { nome: 'Fabio Luiz Vieira', crm: '97046', uf: 'SP' },
  { nome: 'Fernando Macei Drudi', crm: '139300', uf: 'SP' },
  { nome: 'José Roberto Carlucci', crm: '62020', uf: 'SP' },
  { nome: 'Angelo Vattimo', crm: '42210', uf: 'SP' },
  { nome: 'Francisco Eduardo Cardoso Alves', crm: '115103', uf: 'SP' },
  { nome: 'Irene Abramovich', crm: '12939', uf: 'SP' },
  { nome: 'André Luiz Petineli Reda', crm: '102016', uf: 'SP' },
  { nome: 'Rodolpho Uehara', crm: '116278', uf: 'SP' },
  { nome: 'Walter Domingos de Matos Costa', crm: '109900', uf: 'SP' },
  { nome: 'João Tadeu Vergueiro Renaud', crm: '34549', uf: 'SP' },
  { nome: 'Sandra Cristina Haas', crm: '128705', uf: 'SP' },
  { nome: 'André Luiz Cecílio', crm: '112241', uf: 'SP' },
  { nome: 'Eliana Aparecida Ramos Rodrigues', crm: '61958', uf: 'SP' },
  { nome: 'Cassio Luiz Miura', crm: '57375', uf: 'SP' },
  { nome: 'Pamella Moreno Nakvasas', crm: '144762', uf: 'SP' },
]

export function formatCrmDisplay(crm: string, uf: string): string {
  const digits = crm.replace(/\D/g, '')
  const withDots =
    digits.length > 3
      ? `${digits.slice(0, -3)}.${digits.slice(-3)}`
      : digits
  return `CRM-${uf} ${withDots}`
}
