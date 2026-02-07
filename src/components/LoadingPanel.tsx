'use client'

import { useState, useEffect } from 'react'

const STEPS = [
  'Analisando seu nicho de mercado...',
  'Lendo arquivos e catálogos enviados...',
  'Pesquisando tendências do momento...',
  'Analisando seu site e redes sociais...',
  'Criando estratégia de conteúdo...',
  'Escrevendo copies persuasivas...',
  'Definindo briefing visual para cada post...',
  'Montando CTAs e hashtags...',
  'Finalizando calendário editorial...',
]

export default function LoadingPanel() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-xl border border-jarvis-400/30 bg-jarvis-800 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <h3 className="text-lg font-semibold text-white">Jarvis processando...</h3>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 transition-all duration-500 ${
              i <= currentStep ? 'opacity-100' : 'opacity-20'
            }`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                i < currentStep
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : i === currentStep
                  ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                  : 'bg-jarvis-600 text-gray-500'
              }`}
            >
              {i < currentStep ? '✓' : i === currentStep ? '●' : '○'}
            </div>
            <span
              className={`text-sm ${
                i < currentStep
                  ? 'text-cyan-400/70'
                  : i === currentStep
                  ? 'text-cyan-400'
                  : 'text-gray-600'
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="h-1.5 overflow-hidden rounded-full bg-jarvis-600">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-600">
          Isso pode levar de 30s a 2 min dependendo da quantidade de conteúdo...
        </p>
      </div>
    </div>
  )
}
