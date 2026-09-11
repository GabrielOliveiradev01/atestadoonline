-- Só a tabela de pagamentos (se o schema de atestados já existir)
create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  asaas_payment_id text not null unique,
  plano_id text not null check (plano_id in ('1_dia', '3_dias')),
  valor numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'expired', 'cancelled')),
  external_reference text,
  pagador_nome text,
  pagador_cpf text,
  pix_payload text,
  pix_qr_base64 text,
  pix_expiration timestamptz,
  webhook_event text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists pagamentos_asaas_payment_id_idx
  on public.pagamentos (asaas_payment_id);
create index if not exists pagamentos_status_idx
  on public.pagamentos (status);

alter table public.pagamentos enable row level security;

drop policy if exists "pagamentos insert" on public.pagamentos;
create policy "pagamentos insert"
  on public.pagamentos for insert
  to anon, authenticated
  with check (true);

drop policy if exists "pagamentos select" on public.pagamentos;
create policy "pagamentos select"
  on public.pagamentos for select
  to anon, authenticated
  using (true);

drop policy if exists "pagamentos update" on public.pagamentos;
create policy "pagamentos update"
  on public.pagamentos for update
  to anon, authenticated
  using (true)
  with check (true);
