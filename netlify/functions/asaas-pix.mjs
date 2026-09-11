import {
  PLANOS,
  asaasConfig,
  asaasFetch,
  corsOptions,
  json,
  onlyDigits,
  supabaseRest,
  todayIsoDate,
} from './_asaas.mjs'

/**
 * Cliente interno do Asaas (obrigatório na API de cobrança).
 * O pagador final NÃO preenche nada — criamos um cliente descartável por Pix.
 */
async function createSilentCustomer() {
  const fixed = process.env.ASAAS_CUSTOMER_ID?.trim()
  if (fixed) return { ok: true, customerId: fixed }

  const defaultCpf = onlyDigits(process.env.ASAAS_DEFAULT_CPF || '')
  const body = {
    name: `Pagador Atestado ${Date.now()}`,
    notificationDisabled: true,
  }
  if (defaultCpf.length === 11 || defaultCpf.length === 14) {
    body.cpfCnpj = defaultCpf
  }

  const created = await asaasFetch('/customers', { method: 'POST', body })
  if (created.ok && created.data?.id) {
    return { ok: true, customerId: created.data.id }
  }

  // Se falhou por CPF e temos CPF padrão, tenta reutilizar cliente existente
  if (defaultCpf) {
    const search = await asaasFetch(`/customers?cpfCnpj=${defaultCpf}&limit=1`)
    const existing = search.data?.data?.[0]?.id
    if (existing) return { ok: true, customerId: existing }
  }

  return {
    ok: false,
    error:
      created.data?.errors?.[0]?.description ||
      'Asaas recusou criar o cliente interno da cobrança Pix.',
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return corsOptions()
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Método não permitido' })
  }

  const cfg = asaasConfig()
  if (!cfg.ok) return json(500, { error: cfg.error })

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'JSON inválido' })
  }

  const plano = PLANOS[body.planoId]
  if (!plano) {
    return json(400, { error: 'Plano inválido. Use 1_dia ou 3_dias.' })
  }

  const customer = await createSilentCustomer()
  if (!customer.ok) return json(500, { error: customer.error })

  const externalReference = `atestado_${plano.id}_${Date.now()}`
  const paymentRes = await asaasFetch('/payments', {
    method: 'POST',
    body: {
      customer: customer.customerId,
      billingType: 'PIX',
      value: plano.value,
      dueDate: todayIsoDate(),
      description: plano.name,
      externalReference,
    },
  })

  if (!paymentRes.ok || !paymentRes.data?.id) {
    const msg =
      paymentRes.data?.errors?.[0]?.description ||
      'Não foi possível gerar a cobrança Pix.'
    return json(paymentRes.status || 502, { error: msg, details: paymentRes.data })
  }

  const paymentId = paymentRes.data.id
  const qrRes = await asaasFetch(`/payments/${encodeURIComponent(paymentId)}/pixQrCode`)
  if (!qrRes.ok || !qrRes.data?.payload) {
    const msg =
      qrRes.data?.errors?.[0]?.description ||
      'Cobrança criada, mas o QR Code Pix não ficou disponível.'
    return json(qrRes.status || 502, { error: msg })
  }

  const row = {
    asaas_payment_id: paymentId,
    plano_id: plano.id,
    valor: plano.value,
    status: 'pending',
    external_reference: externalReference,
    pagador_nome: null,
    pagador_cpf: null,
    pix_payload: qrRes.data.payload,
    pix_qr_base64: qrRes.data.encodedImage || null,
    pix_expiration: qrRes.data.expirationDate || null,
  }

  const db = await supabaseRest('pagamentos', {
    method: 'POST',
    body: row,
    prefer: 'return=representation',
  })

  if (!db.ok) {
    return json(502, {
      error:
        'Pix gerado no Asaas, mas falhou ao registrar no banco. Verifique a tabela pagamentos no Supabase.',
      details: db.data,
      paymentId,
    })
  }

  return json(200, {
    paymentId,
    planoId: plano.id,
    valor: plano.value,
    dias: plano.dias,
    encodedImage: qrRes.data.encodedImage,
    payload: qrRes.data.payload,
    expirationDate: qrRes.data.expirationDate || null,
  })
}
