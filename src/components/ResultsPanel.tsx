'use client'

import { useState } from 'react'
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp, Download, Calendar } from 'lucide-react'
import type { ContentPost } from '@/app/page'

interface ResultsPanelProps {
  posts: ContentPost[]
  onBack: () => void
}

export default function ResultsPanel({ posts, onBack }: ResultsPanelProps) {
  const [expandedPost, setExpandedPost] = useState<number | null>(0)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const exportAllAsText = () => {
    const text = posts.map((post, i) => (
      `═══════════════════════════════════════\n` +
      `DIA ${post.day} - ${post.date}\n` +
      `═══════════════════════════════════════\n\n` +
      `TEMA: ${post.theme}\n` +
      `TÍTULO: ${post.title}\n` +
      `FORMATO: ${post.format}\n\n` +
      `--- COPY ---\n${post.copy}\n\n` +
      `--- BRIEFING VISUAL ---\n${post.visualBriefing}\n\n` +
      `--- PRODUTOS ---\n${post.products}\n\n` +
      `--- CTA ---\n${post.cta}\n\n` +
      `--- HASHTAGS ---\n${post.hashtags.join(' ')}\n\n`
    )).join('\n')

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'content-cave-calendario.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-cave-400/30 bg-cave-700 px-4 py-2 text-sm text-gray-300 transition-all hover:border-amber-500/30 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao formulário
        </button>
        <div className="flex gap-3">
          <button
            onClick={exportAllAsText}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-cave-900 transition-all hover:bg-amber-400"
          >
            <Download className="h-4 w-4" />
            Exportar Tudo
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-400" />
          <p className="font-semibold text-amber-400">
            Calendário Editorial — {posts.length} posts gerados
          </p>
        </div>
        <p className="mt-1 text-sm text-amber-400/70">
          Clique em cada post para expandir e ver todos os detalhes. Use o botão Exportar para baixar tudo.
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.map((post, i) => (
          <div
            key={i}
            className={`animate-fade-in rounded-xl border transition-all ${
              expandedPost === i
                ? 'border-amber-500/30 bg-cave-800'
                : 'border-cave-400/30 bg-cave-800/60 hover:border-cave-300'
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Post Header */}
            <button
              onClick={() => setExpandedPost(expandedPost === i ? null : i)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-sm font-bold text-amber-400">
                  D{post.day}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{post.title}</p>
                  <p className="text-xs text-gray-500">{post.date} • {post.format} • {post.theme}</p>
                </div>
              </div>
              {expandedPost === i ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {/* Post Details */}
            {expandedPost === i && (
              <div className="border-t border-cave-400/20 p-5">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Copy */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Copy do Post
                      </label>
                      <button
                        onClick={() => copyToClipboard(post.copy, i)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-400"
                      >
                        {copiedIndex === i ? (
                          <><Check className="h-3 w-3" /> Copiado!</>
                        ) : (
                          <><Copy className="h-3 w-3" /> Copiar</>
                        )}
                      </button>
                    </div>
                    <div className="rounded-lg border border-cave-400/20 bg-cave-700 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                        {post.copy}
                      </p>
                    </div>
                  </div>

                  {/* Visual Briefing */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Briefing Visual (Designer)
                    </label>
                    <div className="rounded-lg border border-cave-400/20 bg-cave-700 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                        {post.visualBriefing}
                      </p>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Produtos Envolvidos
                    </label>
                    <div className="rounded-lg border border-cave-400/20 bg-cave-700 p-4">
                      <p className="text-sm text-gray-300">{post.products}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-amber-400">
                      CTA (Call to Action)
                    </label>
                    <div className="rounded-lg border border-cave-400/20 bg-cave-700 p-4">
                      <p className="text-sm text-gray-300">{post.cta}</p>
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="mt-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Hashtags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((tag, j) => (
                      <span
                        key={j}
                        className="rounded-full bg-cave-600 px-3 py-1 text-xs text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
