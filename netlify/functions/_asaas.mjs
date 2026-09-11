const SANDBOX = 'https://api-sandbox.asaas.com/v3'
const PRODUCTION = 'https://api.asaas.com/v3'

export function asaasConfig() {
  const apiKey = process.env.ASAAS_API_KEY?.trim()
  if (!apiKey) {
    return { ok: false, error: 'ASAAS_API_KEY não configurada no Netlify.' }
  }
  const env = (process.env.ASAAS_ENV || 'sandbox').toLowerCase()
  const baseUrl = env === 'production' ? PRODUCTION : SANDBOX
  return { ok: true, apiKey, baseUrl, env }
}

export async function asaasFetch(path, { method = 'GET', body } = {}) {
  const cfg = asaasConfig()
  if (!cfg.ok) {
    return { ok: false, status: 500, data: { errors: [{ description: cfg.error }] } }
  }

  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: cfg.apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }

  return { ok: res.ok, status: res.status, data }
}

export function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim()
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim()
  if (!url || !key) {
    return { ok: false, error: 'Supabase não configurado nas variáveis do Netlify.' }
  }
  return { ok: true, url: url.replace(/\/$/, ''), key }
}

export async function supabaseRest(path, { method = 'GET', body, prefer } = {}) {
  const cfg = supabaseConfig()
  if (!cfg.ok) {
    return { ok: false, status: 500, data: { error: cfg.error } }
  }

  const headers = {
    apikey: cfg.key,
    Authorization: `Bearer ${cfg.key}`,
    'content-type': 'application/json',
  }
  if (prefer) headers.Prefer = prefer

  const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }

  return { ok: res.ok, status: res.status, data }
}

export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type, asaas-access-token',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
    },
    body: JSON.stringify(body),
  }
}

export function corsOptions() {
  return json(204, {})
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export function onlyDigits(value = '') {
  return String(value).replace(/\D/g, '')
}

export const PLANOS = {
  '1_dia': {
    id: '1_dia',
    name: 'Atestado — 1 dia',
    description: 'Emissão de atestado médico com afastamento de 1 dia',
    value: 70,
    dias: '1',
  },
  '3_dias': {
    id: '3_dias',
    name: 'Atestado — 3 dias',
    description: 'Emissão de atestado médico com afastamento de 3 dias',
    value: 90,
    dias: '3',
  },
}

export const PAID_EVENTS = new Set([
  'PAYMENT_RECEIVED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_RECEIVED_IN_CASH',
])
