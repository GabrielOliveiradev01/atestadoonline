# Atestado Online

Sistema de emissão de atestado médico para médicos e radiologistas.

## Telas

1. **Dados** — formulário do paciente, afastamento e profissional
2. **PDF** — visualização do atestado oficial, impressão e download

## Banco de dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute `supabase/schema.sql`
3. Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

As chaves ficam em **Project Settings → API**.

Ao clicar em **Gerar atestado PDF**, o registro é salvo na tabela `atestados`.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`).
