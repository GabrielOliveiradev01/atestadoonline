import { useState } from 'react'
import { DadosScreen } from './components/DadosScreen'
import { PdfScreen } from './components/PdfScreen'
import { emptyAtestado, type AtestadoData } from './types'
import './App.css'

type Screen = 'dados' | 'pdf'

export default function App() {
  const [screen, setScreen] = useState<Screen>('dados')
  const [data, setData] = useState<AtestadoData>(emptyAtestado)

  if (screen === 'pdf') {
    return <PdfScreen data={data} onVoltar={() => setScreen('dados')} />
  }

  return (
    <DadosScreen
      data={data}
      onChange={setData}
      onGerar={() => setScreen('pdf')}
    />
  )
}
