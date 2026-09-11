export type CidExemplo = {
  cid: string
  condicao: string
}

/** Exemplos de CID para seleção rápida (sem afastamento exibido). */
export const CID_EXEMPLOS: CidExemplo[] = [
  { cid: 'J06.9', condicao: 'Infecção respiratória aguda' },
  { cid: 'J11.1', condicao: 'Gripe' },
  { cid: 'A09', condicao: 'Gastroenterite/diarreia infecciosa' },
  { cid: 'M54.5', condicao: 'Dor lombar' },
  { cid: 'M54.4', condicao: 'Lombalgia com ciática' },
  { cid: 'M25.5', condicao: 'Dor articular' },
  { cid: 'S93.4', condicao: 'Entorse de tornozelo' },
  { cid: 'S52.5', condicao: 'Fratura do punho' },
  { cid: 'F32.0', condicao: 'Episódio depressivo leve' },
  { cid: 'F32.1', condicao: 'Episódio depressivo moderado' },
  { cid: 'F41.1', condicao: 'Transtorno de ansiedade generalizada' },
  { cid: 'K52.9', condicao: 'Gastroenterite/colite não infecciosa' },
  { cid: 'U07.1', condicao: 'COVID-19' },
]
