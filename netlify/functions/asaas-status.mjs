import { corsOptions, json, supabaseRest, PLANOS } from './_asaas.mjs'

/**
 * Status liberado SOMENTE quando o webhook marcou status=paid no Supabase.
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return corsOptions()
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Método não permitido' })
  }

  const paymentId = (event.queryStringParameters || {}).paymentId?.trim()
  if (!paymentId) {
    return json(400, { error: 'paymentId obrigatório' })
  }

  const result = await supabaseRest(
    `pagamentos?asaas_payment_id=eq.${encodeURIComponent(paymentId)}&select=asaas_payment_id,plano_id,status,valor,paid_at&limit=1`,
  )

  if (!result.ok) {
    return json(502, { error: 'Falha ao consultar pagamento', details: result.data })
  }

  const row = Array.isArray(result.data) ? result.data[0] : null
  if (!row) {
    return json(404, { error: 'Pagamento não encontrado', paid: false })
  }

  const paid = row.status === 'paid'
  const planoId = PLANOS[row.plano_id] ? row.plano_id : null

  return json(200, {
    paid,
    status: row.status,
    planoId,
    paymentId: row.asaas_payment_id,
    paidAt: row.paid_at || null,
  })
}
