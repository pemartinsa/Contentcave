'use client'

import { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import type { FormData } from '@/app/page'

const CHANNELS = [
  { value: 'instagram', label: 'Instagram', emoji: '📸' },
  { value: 'facebook', label: 'Facebook', emoji: '📘' },
  { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { value: 'linkedin', label: 'LinkedIn', emoji: '💼' },
  { value: 'youtube', label: 'YouTube', emoji: '🎬' },
  { value: 'twitter', label: 'X (Twitter)', emoji: '𝕏' },
  { value: 'pinterest', label: 'Pinterest', emoji: '📌' },
  { value: 'threads', label: 'Threads', emoji: '🧵' },
]

const DURATIONS = [
  { value: '7', label: '1 Semana (7 dias)' },
  { value: '15', label: 'Quinzena (15 dias)' },
  { value: '30', label: '1 Mês (30 dias)' },
]

const FREQUENCIES = [
  { value: '1_per_day', label: '1 post por dia' },
  { value: '2_per_day', label: '2 posts por dia' },
  { value: '3_per_week', label: '3 vezes por semana' },
  { value: '5_per_week', label: '5 vezes por semana' },
]

interface ContentFormProps {
  onSubmit: (data: FormData) => void
  loading: boolean
}

export default function ContentForm({ onSubmit, loading }: ContentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    channel: '',
    duration: '',
    frequency: '',
    niche: '',
    suggestion: '',
    product: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const update = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isValid = formData.channel && formData.duration && formData.frequency && formData.niche && formData.product

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-cave-400/30 bg-cave-800 p-6">
        <h2 className="mb-6 text-lg font-semibold text-white">Criador de Conteúdo</h2>

        {/* Channel Selection */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Qual o canal principal? <span className="text-amber-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CHANNELS.map((ch) => (
              <button
                type="button"
                key={ch.value}
                onClick={() => update('channel', ch.value)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  formData.channel === ch.value
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-cave-400/30 bg-cave-700 text-gray-400 hover:border-cave-300 hover:text-white'
                }`}
              >
                <span>{ch.emoji}</span>
                <span>{ch.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Quantidade de dias de conteúdo <span className="text-amber-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map((d) => (
              <button
                type="button"
                key={d.value}
                onClick={() => update('duration', d.value)}
                className={`rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  formData.duration === d.value
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-cave-400/30 bg-cave-700 text-gray-400 hover:border-cave-300 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Frequência de posts <span className="text-amber-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map((f) => (
              <button
                type="button"
                key={f.value}
                onClick={() => update('frequency', f.value)}
                className={`rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  formData.frequency === f.value
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-cave-400/30 bg-cave-700 text-gray-400 hover:border-cave-300 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Niche */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Qual é o seu nicho? <span className="text-amber-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Fitness, Marketing Digital, Gastronomia, Moda..."
            value={formData.niche}
            onChange={(e) => update('niche', e.target.value)}
            className="w-full rounded-lg border border-cave-400/30 bg-cave-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
          />
        </div>

        {/* Product */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            O que você vende? <span className="text-amber-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Curso online de inglês, Consultoria de marketing, Roupas femininas..."
            value={formData.product}
            onChange={(e) => update('product', e.target.value)}
            className="w-full rounded-lg border border-cave-400/30 bg-cave-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
          />
        </div>

        {/* Suggestion (Optional) */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Sugestão de direcional <span className="text-gray-500">(opcional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Foco em conteúdo educativo, tom descontraído, usar humor, abordar dores do público..."
            value={formData.suggestion}
            onChange={(e) => update('suggestion', e.target.value)}
            className="w-full resize-none rounded-lg border border-cave-400/30 bg-cave-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold transition-all ${
            isValid && !loading
              ? 'bg-amber-500 text-cave-900 hover:bg-amber-400 animate-pulse-amber'
              : 'cursor-not-allowed bg-cave-500 text-gray-500'
          }`}
        >
          {loading ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              Gerando conteúdo com IA...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Gerar Conteúdo com IA
            </>
          )}
        </button>
      </div>
    </form>
  )
}
