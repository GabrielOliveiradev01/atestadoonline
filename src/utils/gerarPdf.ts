import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

export async function buildPdfFromElement(el: HTMLElement, qrUrl?: string): Promise<jsPDF> {
  await Promise.all([
    preload('/logos/prefeitura-saude.png'),
    preload('/logos/santa-marcelina.png'),
    preload('/logos/sus.png'),
    qrUrl ? preload(qrUrl) : Promise.resolve(),
  ])
  await new Promise((r) => setTimeout(r, 80))

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })
  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const ratio = Math.min(pageW / canvas.width, pageH / canvas.height)
  const w = canvas.width * ratio
  const h = canvas.height * ratio
  const x = (pageW - w) / 2
  pdf.addImage(img, 'PNG', x, 6, w, Math.min(h, pageH - 12))
  return pdf
}

export async function downloadPdfFromElement(
  el: HTMLElement,
  filename: string,
  qrUrl?: string,
): Promise<void> {
  const pdf = await buildPdfFromElement(el, qrUrl)
  pdf.save(filename)
}

export function validacaoUrlFor(protocolo: string): string {
  const base = (import.meta.env.VITE_VALIDACAO_URL || 'https://validacao-amasaude.netlify.app').replace(/\/$/, '')
  return `${base}/atestado/${encodeURIComponent(protocolo)}`
}
