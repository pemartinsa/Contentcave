'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import ContentForm from '@/components/ContentForm'
import ResultsPanel from '@/components/ResultsPanel'
import LoadingPanel from '@/components/LoadingPanel'

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
  niche: string
  suggestion: string
  product: string
}

export default function Home() {
  const [results, setResults] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState<'form' | 'results'>('form')

  const handleGenerate = async (formData: FormData) => {
    setLoading(true)
    setError('')
    setResults([])

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar conteúdo')
      }

      const data = await response.json()
      setResults(data.posts)
      setActiveSection('results')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-cave-900">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} hasResults={results.length > 0} />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-cave-400/30 bg-cave-900/80 px-8 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">
              {activeSection === 'form' ? 'Gerador de Conteúdo' : 'Conteúdo Gerado'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-cave-600 px-4 py-1.5 text-sm text-gray-300">
              🇧🇷 Português
            </span>
          </div>
        </header>

        <div className="p-8">
          {activeSection === 'form' && (
            <>
              <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="font-semibold text-amber-400">✦ Conteúdo Profissional com IA</p>
                <p className="mt-1 text-sm text-amber-400/80">
                  Preencha os campos abaixo com informações sobre seu negócio. Nossa IA vai pesquisar tendências,
                  criar copies persuasivas e entregar um calendário completo de conteúdo pronto para publicar.
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
                    <div className="rounded-xl border border-cave-400/30 bg-cave-800 p-6">
                      <h3 className="mb-4 text-lg font-semibold text-white">Preview</h3>
                      <div className="flex h-64 items-center justify-center text-cave-300">
                        <p className="text-center text-sm text-gray-500">
                          Preencha o formulário e clique em gerar para ver o preview do seu conteúdo aqui.
                        </p>
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
