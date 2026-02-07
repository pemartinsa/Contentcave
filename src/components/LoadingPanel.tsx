'use client'

import { useState, useEffect } from 'react'

const STEPS = [
  'Analisando seu nicho de mercado...',
  'Pesquisando tendências do momento...',
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
    <div className="rounded-xl border border-cave-400/30 bg-cave-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Gerando Conteúdo...</h3>

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
                  ? 'bg-green-500/20 text-green-400'
                  : i === currentStep
                  ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                  : 'bg-cave-600 text-gray-500'
              }`}
            >
              {i < currentStep ? '✓' : i === currentStep ? '●' : '○'}
            </div>
            <span
              className={`text-sm ${
                i < currentStep
                  ? 'text-green-400'
                  : i === currentStep
                  ? 'text-amber-400'
                  : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="h-1.5 overflow-hidden rounded-full bg-cave-600">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Isso pode levar de 30s a 2 min dependendo da quantidade de conteúdo...
        </p>
      </div>
    </div>
  )
}
