import { PLANOS, formatBrl, type PlanoId } from '../data/planos'
import type { PixInfo } from '../services/asaas'
import './PagamentoScreen.css'

type Props = {
  selected: PlanoId | null
  onSelect: (id: PlanoId) => void
  onGerarPix: () => void
  onNovoPix: () => void
  loading?: boolean
  error?: string | null
  statusMsg?: string | null
  pix: PixInfo | null
  awaitingWebhook?: boolean
}

export function PagamentoScreen({
  selected,
  onSelect,
  onGerarPix,
  onNovoPix,
  loading = false,
  error = null,
  statusMsg = null,
  pix,
  awaitingWebhook = false,
}: Props) {
  const copiarPix = async () => {
    if (!pix?.payload) return
    try {
      await navigator.clipboard.writeText(pix.payload)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="pag">
      <header className="pag__hero">
        <div className="pag__hero-bg" aria-hidden="true" />
        <div className="pag__hero-inner">
          <p className="pag__seal">Prefeitura da Cidade de São Paulo · SMS</p>
          <h1 className="pag__brand">Atestado Online</h1>
          <p className="pag__lead">
            Escolha o plano, pague o Pix e aguarde a confirmação automática para
            emitir o atestado.
          </p>
        </div>
      </header>

      <main className="pag__main">
        {!pix && (
          <>
            <h2 className="pag__title">Selecione o plano</h2>
            <div className="pag__plans" role="list">
              {PLANOS.map((plano) => {
                const ativo = selected === plano.id
                return (
                  <button
                    key={plano.id}
                    type="button"
                    role="listitem"
                    className={ativo ? 'pag__plan is-active' : 'pag__plan'}
                    onClick={() => onSelect(plano.id)}
                    disabled={loading}
                  >
                    <span className="pag__plan-dias">{plano.titulo}</span>
                    <span className="pag__plan-desc">{plano.descricao}</span>
                    <span className="pag__plan-price">{formatBrl(plano.valor)}</span>
                    <span className="pag__plan-pix">Pix avulso</span>
                  </button>
                )
              })}
            </div>

            {statusMsg && <p className="pag__status">{statusMsg}</p>}
            {error && <p className="pag__error">{error}</p>}

            <button
              type="button"
              className="pag__submit"
              disabled={!selected || loading}
              onClick={onGerarPix}
            >
              {loading ? 'Gerando Pix…' : 'Gerar Pix'}
            </button>
          </>
        )}

        {pix && (
          <section className="pag__pix">
            <h2 className="pag__title">Pague com Pix</h2>
            <p className="pag__pix-valor">
              {formatBrl(pix.valor)} ·{' '}
              {PLANOS.find((p) => p.id === pix.planoId)?.titulo}
            </p>

            {pix.encodedImage && (
              <img
                className="pag__qr"
                src={`data:image/png;base64,${pix.encodedImage}`}
                alt="QR Code Pix"
              />
            )}

            <label className="pag__field">
              <span>Pix copia e cola</span>
              <textarea className="pag__payload" readOnly value={pix.payload} rows={4} />
            </label>

            <div className="pag__pix-actions">
              <button type="button" className="pag__submit pag__submit--ghost" onClick={copiarPix}>
                Copiar código Pix
              </button>
              <button type="button" className="pag__submit pag__submit--ghost" onClick={onNovoPix}>
                Gerar novo Pix
              </button>
            </div>

            {awaitingWebhook && (
              <p className="pag__waiting">
                Aguardando confirmação do pagamento…
              </p>
            )}
            {statusMsg && <p className="pag__status">{statusMsg}</p>}
            {error && <p className="pag__error">{error}</p>}
          </section>
        )}
      </main>
    </div>
  )
}
