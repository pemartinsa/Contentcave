'use client'

import { useState, useRef } from 'react'
import { Send, Sparkles, Upload, FileText, Image, X, Globe, AtSign, AlertTriangle } from 'lucide-react'
import VoiceButton from './VoiceButton'
import type { FormData } from '@/app/page'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PDF_SIZE = 10 * 1024 * 1024   // 10MB
const MAX_FILES = 3

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
  { value: '7', label: '1 Semana' },
  { value: '15', label: 'Quinzena' },
  { value: '30', label: '1 Mês' },
]

const FREQUENCIES = [
  { value: '1_per_day', label: '1 post/dia' },
  { value: '2_per_day', label: '2 posts/dia' },
  { value: '3_per_week', label: '3x semana' },
  { value: 'custom', label: 'Outro' },
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
    customFrequency: '',
    niche: '',
    suggestion: '',
    product: '',
    businessName: '',
    targetAudience: '',
    website: '',
    socialProfile: '',
    uploadedFiles: [],
  })
  const [fileError, setFileError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const update = (field: keyof FormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    const files = Array.from(e.target.files || [])

    // Check total file count
    if (formData.uploadedFiles.length + files.length > MAX_FILES) {
      setFileError(`Máximo ${MAX_FILES} arquivos permitidos.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const rejected: string[] = []
    const accepted: File[] = []

    for (const f of files) {
      // Check type
      const isImage = f.type === 'image/jpeg' || f.type === 'image/jpg' || f.type === 'image/png'
      const isPdf = f.type === 'application/pdf'

      if (!isImage && !isPdf) {
        rejected.push(`${f.name}: formato não suportado`)
        continue
      }

      // Check size
      if (isImage && f.size > MAX_IMAGE_SIZE) {
        rejected.push(`${f.name}: imagem muito grande (máx 5MB)`)
        continue
      }
      if (isPdf && f.size > MAX_PDF_SIZE) {
        rejected.push(`${f.name}: PDF muito grande (máx 10MB)`)
        continue
      }

      accepted.push(f)
    }

    if (rejected.length > 0) {
      setFileError(rejected.join('. '))
    }

    if (accepted.length > 0) {
      update('uploadedFiles', [...formData.uploadedFiles, ...accepted])
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    const newFiles = formData.uploadedFiles.filter((_: File, i: number) => i !== index)
    update('uploadedFiles', newFiles)
    setFileError('')
  }

  const handleVoiceTranscript = (text: string) => {
    update('suggestion', formData.suggestion ? formData.suggestion + ' ' + text : text)
  }

  // Product text OR file is required (not both mandatory)
  const hasProduct = formData.product.trim() || formData.uploadedFiles.length > 0
  const isValid = formData.channel && formData.duration &&
    (formData.frequency === 'custom' ? formData.customFrequency : formData.frequency) &&
    formData.niche && hasProduct

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Voice Input */}
      <VoiceButton onTranscript={handleVoiceTranscript} />

      <div className="rounded-xl border border-jarvis-400/50 bg-jarvis-800/80 p-6 backdrop-blur-sm">
        <h2 className="mb-1 text-lg font-semibold text-white">Configurar Conteúdo</h2>
        <p className="mb-6 text-xs text-gray-500">Preencha os dados do seu negócio para gerar conteúdo personalizado</p>

        {/* Channel Selection */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Canal principal <span className="text-cyan-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CHANNELS.map((ch) => (
              <button
                type="button"
                key={ch.value}
                onClick={() => update('channel', ch.value)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  formData.channel === ch.value
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-jarvis-400/50 bg-jarvis-700 text-gray-400 hover:border-jarvis-300 hover:text-white'
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
            Dias de conteúdo <span className="text-cyan-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map((d) => (
              <button
                type="button"
                key={d.value}
                onClick={() => update('duration', d.value)}
                className={`rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  formData.duration === d.value
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-jarvis-400/50 bg-jarvis-700 text-gray-400 hover:border-jarvis-300 hover:text-white'
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
            Frequência de posts <span className="text-cyan-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FREQUENCIES.map((f) => (
              <button
                type="button"
                key={f.value}
                onClick={() => update('frequency', f.value)}
                className={`rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  formData.frequency === f.value
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-jarvis-400/50 bg-jarvis-700 text-gray-400 hover:border-jarvis-300 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {formData.frequency === 'custom' && (
            <input
              type="text"
              placeholder="Ex: 4 vezes por semana, dia sim dia não..."
              value={formData.customFrequency}
              onChange={(e) => update('customFrequency', e.target.value)}
              className="mt-2 w-full rounded-lg border border-jarvis-400/50 bg-jarvis-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
            />
          )}
        </div>

        {/* Business Name */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Nome do seu negócio/perfil <span className="text-cyan-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Studio Fitness SP, Dr. João Saúde..."
            value={formData.businessName}
            onChange={(e) => update('businessName', e.target.value)}
            className="w-full rounded-lg border border-jarvis-400/50 bg-jarvis-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>

        {/* Niche */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Qual é o seu nicho? <span className="text-cyan-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Fitness, Marketing Digital, Gastronomia, Moda..."
            value={formData.niche}
            onChange={(e) => update('niche', e.target.value)}
            className="w-full rounded-lg border border-jarvis-400/50 bg-jarvis-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>

        {/* Target Audience */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Público-alvo <span className="text-gray-600">(opcional)</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Mulheres acima de 45 anos com alto poder aquisitivo, jovens 18-25..."
            value={formData.targetAudience}
            onChange={(e) => update('targetAudience', e.target.value)}
            className="w-full rounded-lg border border-jarvis-400/50 bg-jarvis-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
          <p className="mt-1 text-xs text-gray-600">Se não preencher, o Jarvis define o público ideal para você</p>
        </div>

        {/* Product + File Upload */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            O que você vende? <span className="text-cyan-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Descreva ou anexe um arquivo abaixo (catálogo, foto do produto...)"
            value={formData.product}
            onChange={(e) => update('product', e.target.value)}
            className="w-full rounded-lg border border-jarvis-400/50 bg-jarvis-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
          {!formData.product.trim() && formData.uploadedFiles.length === 0 && (
            <p className="mt-1 text-xs text-gray-600">Preencha o campo acima ou anexe um arquivo abaixo</p>
          )}
          {!formData.product.trim() && formData.uploadedFiles.length > 0 && (
            <p className="mt-1 text-xs text-cyan-600">Jarvis vai analisar seus arquivos para entender seus produtos</p>
          )}

          {/* File Upload Button */}
          <div className="mt-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={formData.uploadedFiles.length >= MAX_FILES}
              className={`flex w-full items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm transition-all ${
                formData.uploadedFiles.length >= MAX_FILES
                  ? 'border-jarvis-500 bg-jarvis-800 text-gray-600 cursor-not-allowed'
                  : 'border-jarvis-400/50 bg-jarvis-700/50 text-gray-400 hover:border-cyan-500/30 hover:text-cyan-400'
              }`}
            >
              <Upload className="h-4 w-4" />
              {formData.uploadedFiles.length >= MAX_FILES
                ? `Limite de ${MAX_FILES} arquivos atingido`
                : 'Anexar imagem do produto ou catálogo PDF'
              }
            </button>
            <p className="mt-1 text-xs text-gray-600">
              Imagens: JPEG, PNG (máx 5MB) | PDF: máx 10MB | Limite: {MAX_FILES} arquivos
            </p>
          </div>

          {/* File Error */}
          {fileError && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <p className="text-xs text-red-400">{fileError}</p>
            </div>
          )}

          {/* Uploaded Files */}
          {formData.uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {formData.uploadedFiles.map((file: File, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-jarvis-400/30 bg-jarvis-700/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {file.type === 'application/pdf' ? (
                      <FileText className="h-4 w-4 text-red-400" />
                    ) : (
                      <Image className="h-4 w-4 text-green-400" />
                    )}
                    <span className="text-xs text-gray-300 truncate max-w-[200px]">{file.name}</span>
                    <span className="text-[10px] text-gray-600">
                      ({(file.size / (1024 * 1024)).toFixed(1)}MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Website */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            <Globe className="mr-1 inline h-3.5 w-3.5" />
            Website do seu negócio <span className="text-gray-600">(opcional)</span>
          </label>
          <input
            type="url"
            placeholder="https://www.seunegocio.com.br"
            value={formData.website}
            onChange={(e) => update('website', e.target.value)}
            className="w-full rounded-lg border border-jarvis-400/50 bg-jarvis-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
          <p className="mt-1 text-xs text-gray-600">Jarvis analisa seu site para entender melhor seu negócio</p>
        </div>

        {/* Social Profile */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            <AtSign className="mr-1 inline h-3.5 w-3.5" />
            Rede social do seu negócio <span className="text-gray-600">(opcional)</span>
          </label>
          <input
            type="url"
            placeholder="https://instagram.com/seunegocio"
            value={formData.socialProfile}
            onChange={(e) => update('socialProfile', e.target.value)}
            className="w-full rounded-lg border border-jarvis-400/50 bg-jarvis-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
          <p className="mt-1 text-xs text-gray-600">Jarvis faz um diagnóstico do que você já publica</p>
        </div>

        {/* Suggestion (Optional) */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Sugestão de direcional <span className="text-gray-600">(opcional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Foco em conteúdo educativo, tom descontraído, usar humor, abordar dores do público..."
            value={formData.suggestion}
            onChange={(e) => update('suggestion', e.target.value)}
            className="w-full resize-none rounded-lg border border-jarvis-400/50 bg-jarvis-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold transition-all ${
            isValid && !loading
              ? 'bg-cyan-500 text-jarvis-900 hover:bg-cyan-400 animate-pulse-cyan'
              : 'cursor-not-allowed bg-jarvis-500 text-gray-500'
          }`}
        >
          {loading ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              Jarvis está processando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Gerar Conteúdo com Jarvis
            </>
          )}
        </button>
      </div>
    </form>
  )
}
