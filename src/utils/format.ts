export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function onlyDigits(value: string, max = 11): string {
  return value.replace(/\D/g, '').slice(0, max)
}

export function formatDateBr(iso: string): string {
  if (!iso) return '__ / __ / ____'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d} / ${m} / ${y}`
}

export function formatDateParts(iso: string): { d: string; m: string; y: string } {
  if (!iso) return { d: '__', m: '__', y: '____' }
  const [y, m, d] = iso.split('-')
  return { d: d || '__', m: m || '__', y: y || '____' }
}

export function padDias(n: number | string): string {
  const num = Number(n) || 0
  return String(num).padStart(2, '0')
}

export function diasPorExtenso(n: number): string {
  const map: Record<number, string> = {
    1: 'Um',
    2: 'Dois',
    3: 'Três',
    4: 'Quatro',
    5: 'Cinco',
    6: 'Seis',
    7: 'Sete',
    8: 'Oito',
    9: 'Nove',
    10: 'Dez',
    11: 'Onze',
    12: 'Doze',
    13: 'Treze',
    14: 'Quatorze',
    15: 'Quinze',
    20: 'Vinte',
    30: 'Trinta',
  }
  return map[n] ?? String(n)
}

export function generateProtocolo(): string {
  const now = new Date()
  const y = now.getFullYear()
  const seq = String(Math.floor(Math.random() * 9_000_000) + 1_000_000)
  return `AT-${y}-${seq}`
}

export function formatHoraCurta(isoDate: string, hora: string): string {
  const parts = formatDateParts(isoDate)
  return `${parts.d}/${parts.m} às ${hora || '--:--'}`
}
