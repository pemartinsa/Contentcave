'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import ContentForm from '@/components/ContentForm'
import ResultsPanel from '@/components/ResultsPanel'
import LoadingPanel from '@/components/LoadingPanel'
import CoinDisplay from '@/components/CoinDisplay'
import JarvisCore from '@/components/JarvisCore'

export interface ContentPost {
  day: number
  date: string
  theme: string
  title: string
  copy: string
  visualBriefing: string
  products: string
  cta: string
  format: string
  hashtags: string[]
}

export interface FormData {
  channel: string
  duration: string
  frequency: string
  customFrequency: string
  niche: string
  suggestion: string
  product: string
  businessName: string
  targetAudience: string
  website: string
  socialProfile: string
  uploadedFiles: File[]
}

const COST_PER_GENERATION = 10

function compressImage(file: File): Promise<{ name: string; type: string; data: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      const MAX_SIZE = 800
      let w = img.width
      let h = img.height
      if (w > MAX_SIZE || h > MAX_SIZE) {
        if (w > h) {
          h = Math.round((h * MAX_SIZE) / w)
          w = MAX_SIZE
        } else {
          w = Math.round((w * MAX_SIZE) / h)
          h = MAX_SIZE
        }
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      const data = canvas.toDataURL('image/jpeg', 0.7)
      resolve({ name: file.name, type: 'image/jpeg', data })
    }
    img.src = url
  })
}

export default function Home() {
  const [results, setResults] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState<'form' | 'results'>('form')
  const [coins, setCoins] = useState(100)

  const handlePurchaseCoins = (amount: number) => {
    setCoins(prev => prev + amount)
  }

  const handleGenerate = async (formData: FormData) => {
    if (coins < COST_PER_GENERATION) {
      setError(`Coins insuficientes. Você precisa de ${COST_PER_GENERATION} coins para gerar conteúdo. Compre mais coins clicando no botão de coins.`)
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      const payload: Record<string, unknown> = {
        channel: formData.channel,
        duration: formData.duration,
        frequency: formData.frequency === 'custom' ? formData.customFrequency : formData.frequency,
        niche: formData.niche,
        suggestion: formData.suggestion,
        product: formData.product,
        businessName: formData.businessName,
        targetAudience: formData.targetAudience,
        website: formData.website,
        socialProfile: formData.socialProfile,
        files: [] as { name: string; type: string; data: string }[],
      }

      if (formData.uploadedFiles.length > 0) {
        const filePromises = formData.uploadedFiles.map(async (file) => {
          // Compress images to max 800px and reduce quality
          if (file.type.startsWith('image/')) {
            return compressImage(file)
          }
          // PDFs: limit to 5MB
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`Arquivo ${file.name} muito grande (máx 5MB para PDFs)`)
          }
          return new Promise<{ name: string; type: string; data: string }>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                name: file.name,
                type: file.type,
                data: reader.result as string,
              })
            }
            reader.readAsDataURL(file)
          })
        })
        payload.files = await Promise.all(filePromises)
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar conteúdo')
      }

      const data = await response.json()
      setResults(data.posts)
      setCoins(prev => prev - COST_PER_GENERATION)
      setActiveSection('results')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-jarvis-900">
      <JarvisCore />

      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} hasResults={results.length > 0} />

      <main className="relative flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-jarvis-400/30 bg-jarvis-900/80 px-8 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="animate-glow-text text-xl font-bold tracking-wider text-cyan-400">
                J.A.R.V.I.S
              </h1>
            </div>
            <span className="text-sm text-gray-600">|</span>
            <span className="text-sm text-gray-400">
              {activeSection === 'form' ? 'Content Intelligence System' : 'Conteúdo Gerado'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <CoinDisplay coins={coins} onPurchase={handlePurchaseCoins} />
            <span className="rounded-full border border-jarvis-400/30 bg-jarvis-700 px-4 py-1.5 text-sm text-gray-400">
              🇧🇷 PT-BR
            </span>
          </div>
        </header>

        <div className="relative z-[1] p-8">
          {activeSection === 'form' && (
            <>
              <div className="mb-6 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                <p className="font-semibold text-cyan-400">✦ Jarvis Content Intelligence</p>
                <p className="mt-1 text-sm text-cyan-400/60">
                  Preencha os campos abaixo ou use o comando de voz. Jarvis vai analisar seu negócio,
                  pesquisar tendências, e criar um calendário completo com copies persuasivas, CTAs estratégicos
                  e briefings visuais prontos para seu designer.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <ContentForm onSubmit={handleGenerate} loading={loading} />
                </div>
                <div className="lg:col-span-2">
                  {loading ? <LoadingPanel /> : (
                    <div className="rounded-xl border border-jarvis-400/30 bg-jarvis-800/80 p-6 backdrop-blur-sm">
                      <h3 className="mb-4 text-lg font-semibold text-white">Preview</h3>
                      <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/5">
                            <svg className="h-8 w-8 text-cyan-500/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">
                            Preencha o formulário e acione o Jarvis para ver o preview do seu conteúdo aqui.
                          </p>
                          <p className="mt-2 text-xs text-gray-700">
                            Custo: {COST_PER_GENERATION} coins por geração
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeSection === 'results' && results.length > 0 && (
            <ResultsPanel posts={results} onBack={() => setActiveSection('form')} />
          )}
        </div>
      </main>
    </div>
  )
}
