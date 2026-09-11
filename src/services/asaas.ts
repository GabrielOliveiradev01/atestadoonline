import type { PlanoId } from '../data/planos'

const STORAGE_KEY = 'atestado_pagamento'

export type PixInfo = {
  paymentId: string
  planoId: PlanoId
  valor: number
  encodedImage: string
  payload: string
  expirationDate: string | null
}

export type PagamentoSession = {
  paymentId: string
  planoId: PlanoId
  paid: boolean
  pix?: PixInfo
}

export function savePagamentoSession(session: PagamentoSession) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function loadPagamentoSession(): PagamentoSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PagamentoSession
    if (!parsed.paymentId || !parsed.planoId) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPagamentoSession() {
  sessionStorage.removeItem(STORAGE_KEY)
}

type StatusResponse = {
  paid: boolean
  status: string
  planoId: PlanoId | null
  paymentId: string
  error?: string
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) {
    throw new Error(data.error || 'Falha na comunicação com o pagamento.')
  }
  return data
}

export async function gerarPix(planoId: PlanoId): Promise<PixInfo> {
  const res = await fetch('/api/asaas-pix', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ planoId }),
  })
  return parseJson<PixInfo>(res)
}

/** Consulta se o webhook já marcou o pagamento como pago. */
export async function verificarPagamentoWebhook(
  paymentId: string,
): Promise<StatusResponse> {
  const res = await fetch(
    `/api/asaas-status?paymentId=${encodeURIComponent(paymentId)}`,
  )
  return parseJson<StatusResponse>(res)
}
