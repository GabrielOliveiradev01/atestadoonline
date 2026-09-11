import {
  PAID_EVENTS,
  corsOptions,
  json,
  supabaseRest,
} from './_asaas.mjs'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return corsOptions()
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Método não permitido' })
  }

  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN?.trim()
  if (expectedToken) {
    const received =
      event.headers['asaas-access-token'] ||
      event.headers['Asaas-Access-Token'] ||
      ''
    if (received !== expectedToken) {
      return json(401, { error: 'Token do webhook inválido' })
    }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'JSON inválido' })
  }

  const eventName = body.event
  const paymentId = body.payment?.id

  // Sempre responde 200 para eventos que não nos interessam (evita reenvio infinito)
  if (!paymentId || !PAID_EVENTS.has(eventName)) {
    return json(200, { received: true, ignored: true, event: eventName || null })
  }

  const patch = await supabaseRest(
    `pagamentos?asaas_payment_id=eq.${encodeURIComponent(paymentId)}`,
    {
      method: 'PATCH',
      body: {
        status: 'paid',
        paid_at: new Date().toISOString(),
        webhook_event: eventName,
      },
      prefer: 'return=representation',
    },
  )

  if (!patch.ok) {
    return json(500, { error: 'Falha ao atualizar pagamento', details: patch.data })
  }

  return json(200, {
    received: true,
    paid: true,
    paymentId,
    event: eventName,
    updated: Array.isArray(patch.data) ? patch.data.length : 0,
  })
}
