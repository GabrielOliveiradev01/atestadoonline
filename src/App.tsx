import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DadosScreen } from './components/DadosScreen'
import { PdfScreen } from './components/PdfScreen'
import { ValidacaoScreen } from './components/ValidacaoScreen'
import { emptyAtestado, type AtestadoData } from './types'
import { salvarAtestado } from './services/atestados'
import { isSupabaseConfigured } from './lib/supabase'
import './App.css'

type Screen = 'dados' | 'pdf'

function EmissaoApp() {
  const [screen, setScreen] = useState<Screen>('dados')
  const [data, setData] = useState<AtestadoData>(emptyAtestado)
  const [protocolo, setProtocolo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveWarning, setSaveWarning] = useState<string | null>(null)

  const handleGerar = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveWarning(null)
    try {
      const result = await salvarAtestado(data)
      if (!result.ok) {
        setSaveError(result.error || 'Falha ao salvar no banco de dados.')
        return
      }
      setProtocolo(result.protocolo)
      if (result.offline) {
        setSaveWarning(result.error || 'Modo offline: configure o Supabase no .env')
      }
      setScreen('pdf')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro inesperado ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (screen === 'pdf') {
    return (
      <PdfScreen
        data={data}
        protocolo={protocolo}
        dbWarning={saveWarning}
        onVoltar={() => setScreen('dados')}
      />
    )
  }

  return (
    <DadosScreen
      data={data}
      onChange={setData}
      onGerar={handleGerar}
      saving={saving}
      saveError={saveError}
      dbReady={isSupabaseConfigured}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmissaoApp />} />
        <Route path="/atestado/:protocolo" element={<ValidacaoScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
