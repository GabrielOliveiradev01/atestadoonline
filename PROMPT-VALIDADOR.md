# Prompt para outra IA — Projeto VALIDADOR de Atestado (domínio separado)

Copie e cole o bloco abaixo na outra IA / outro chat / outro repositório.

---

## PROMPT (copie daqui)

Crie um projeto **separado** chamado **Atestado Validação** (só consulta/validação).  
**Não** faça emissão de atestado. Domínio próprio, diferente do sistema emissor.

### Objetivo
Ao escanear o QR Code do atestado impresso, o cidadão cai neste site e vê se o documento é **válido** ou **inválido**, consultando o mesmo banco Supabase do emissor.

### Domínios (separados)
- Emissor (já existe, outro projeto): emite atestado + grava no banco + gera QR
- Validador (ESTE projeto): lê protocolo da URL e consulta o banco

### Formato do QR / URL
O QR do emissor aponta para:
`https://SEU_DOMINIO_VALIDACAO/atestado/{protocolo}`

Exemplo:
`https://validar.atestado.sp.gov.br/atestado/AT-2026-1234567`

Crie rota: `/atestado/:protocolo`

Também tenha tela inicial `/` com campo para digitar o protocolo manualmente e botão "Validar".

### Banco (mesmo Supabase do emissor)
Use as mesmas credenciais (só leitura):

```
VITE_SUPABASE_URL=https://lyvrnuycmimshrjkvexx.supabase.co
VITE_SUPABASE_ANON_KEY=<mesma anon key do emissor>
```

Tabela: `public.atestados`

Consulta:
```sql
select * from atestados where protocolo = :protocolo limit 1;
```

Campos principais:
- protocolo
- paciente_nome
- paciente_documento (mascarar parcialmente na tela, ex.: ***.***.***-60)
- unidade_nome
- data_emissao
- dias_afastamento
- tipo_recomendacao
- profissional_nome
- conselho_uf, conselho_numero
- cid / diagnostico **somente se** autoriza_cid = true
- created_at

### Telas
1. **Validação** (`/atestado/:protocolo`)
   - Loading enquanto busca
   - Se achar: selo **DOCUMENTO VÁLIDO**, dados resumidos do atestado, data/hora da consulta
   - Se não achar: **DOCUMENTO NÃO ENCONTRADO / INVÁLIDO**
2. **Home** (`/`) — formulário protocolo → redireciona para `/atestado/{protocolo}`

### Stack sugerida
Vite + React + TypeScript + @supabase/supabase-js  
Visual institucional (saúde / gov), limpo, mobile-first (QR é lido no celular).

### Segurança
- Nunca use service_role no frontend
- Só SELECT (anon)
- Não exponha CID se `autoriza_cid` for false
- Não mostre documento completo do paciente (mascarar)

### Entrega
- `README` com como rodar
- `.env.example`
- Deploy pronto para o domínio de validação

Quando terminar, me diga a URL final do validador para eu configurar no emissor:
`VITE_VALIDACAO_URL=https://...`

---

## Depois que a outra IA entregar o domínio

No projeto **emissor** (este), atualize o `.env`:

```
VITE_VALIDACAO_URL=https://dominio-que-a-outra-ia-criar
```

Reinicie o `npm run dev`. O QR do PDF passará a abrir direto no validador.
