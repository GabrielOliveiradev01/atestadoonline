-- Atestado Online — schema Supabase
-- Execute no SQL Editor do projeto: https://supabase.com/dashboard

create extension if not exists "pgcrypto";

create table if not exists public.atestados (
  id uuid primary key default gen_random_uuid(),
  protocolo text not null unique,

  -- Unidade
  unidade_nome text not null,
  unidade_cep text,
  unidade_telefone text,
  unidade_endereco text,
  unidade_parceiro text,

  -- Paciente
  paciente_nome text not null,
  paciente_documento text not null,

  -- Atendimento
  data_atendimento_inicio date,
  hora_atendimento_inicio time,
  data_atendimento_fim date,
  hora_atendimento_fim time,

  -- Recomendação
  tipo_recomendacao text not null
    check (tipo_recomendacao in (
      'sem_afastamento',
      'repouso_hoje',
      'afastado_dias',
      'acompanhando',
      'internacao'
    )),
  dias_afastamento integer default 1,
  acompanhante_nome text,
  data_internacao date,

  -- Diagnóstico
  cid text,
  diagnostico text,
  autoriza_cid boolean not null default false,

  -- Emissão
  data_emissao date not null,
  local_emissao text,

  -- Profissional
  tipo_profissional text not null
    check (tipo_profissional in ('medico', 'radiologista')),
  profissional_nome text not null,
  conselho_numero text not null,
  conselho_uf text not null,

  created_at timestamptz not null default now()
);

create index if not exists atestados_protocolo_idx on public.atestados (protocolo);
create index if not exists atestados_paciente_documento_idx on public.atestados (paciente_documento);
create index if not exists atestados_created_at_idx on public.atestados (created_at desc);

alter table public.atestados enable row level security;

-- Políticas abertas para MVP (ajuste depois com autenticação de profissionais)
drop policy if exists "Permitir insert anon" on public.atestados;
create policy "Permitir insert anon"
  on public.atestados for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Permitir select anon" on public.atestados;
create policy "Permitir select anon"
  on public.atestados for select
  to anon, authenticated
  using (true);
