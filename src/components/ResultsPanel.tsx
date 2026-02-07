'use client'

import { useState } from 'react'
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp, Download, Calendar, FileDown } from 'lucide-react'
import type { ContentPost } from '@/app/page'

interface ResultsPanelProps {
  posts: ContentPost[]
  onBack: () => void
}

export default function ResultsPanel({ posts, onBack }: ResultsPanelProps) {
  const [expandedPost, setExpandedPost] = useState<number | null>(0)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const exportAsPdf = async () => {
    setGeneratingPdf(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      const contentWidth = pageWidth - margin * 2
      let y = margin

      // Helper: add text with word wrap
      const addText = (text: string, x: number, currentY: number, fontSize: number, style: string = 'normal', color: [number, number, number] = [220, 220, 220]) => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', style)
        doc.setTextColor(...color)
        const lines = doc.splitTextToSize(text, contentWidth - (x - margin))
        for (const line of lines) {
          if (currentY > 280) {
            doc.addPage()
            currentY = margin
          }
          doc.text(line, x, currentY)
          currentY += fontSize * 0.5
        }
        return currentY
      }

      // Header
      doc.setFillColor(5, 10, 15)
      doc.rect(0, 0, pageWidth, 297, 'F')

      doc.setFillColor(0, 210, 255)
      doc.rect(0, 0, pageWidth, 2, 'F')

      y = 20
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 210, 255)
      doc.text('CONTENT CAVE', margin, y)

      y += 8
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Calendario Editorial - ${posts.length} posts | Gerado por Jarvis AI`, margin, y)

      y += 4
      doc.setDrawColor(0, 80, 120)
      doc.setLineWidth(0.3)
      doc.line(margin, y, pageWidth - margin, y)
      y += 10

      // Posts
      for (const post of posts) {
        if (y > 250) {
          doc.addPage()
          doc.setFillColor(5, 10, 15)
          doc.rect(0, 0, pageWidth, 297, 'F')
          y = margin
        }

        // Day header
        doc.setFillColor(10, 20, 35)
        doc.roundedRect(margin, y - 4, contentWidth, 12, 2, 2, 'F')
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 210, 255)
        doc.text(`DIA ${post.day} - ${post.date}`, margin + 4, y + 3)
        doc.setTextColor(100, 120, 140)
        doc.setFontSize(8)
        doc.text(`${post.format} | ${post.theme}`, pageWidth - margin - 4, y + 3, { align: 'right' })
        y += 14

        // Title
        y = addText(post.title, margin, y, 12, 'bold', [255, 255, 255])
        y += 3

        // Copy
        y = addText('COPY:', margin, y, 8, 'bold', [0, 170, 210])
        y += 1
        y = addText(post.copy, margin, y, 9, 'normal', [200, 200, 200])
        y += 4

        // Visual Briefing
        y = addText('BRIEFING VISUAL:', margin, y, 8, 'bold', [0, 170, 210])
        y += 1
        y = addText(post.visualBriefing, margin, y, 9, 'normal', [180, 180, 180])
        y += 4

        // Products & CTA
        y = addText('PRODUTOS: ' + post.products, margin, y, 8, 'normal', [150, 150, 150])
        y += 2
        y = addText('CTA: ' + post.cta, margin, y, 8, 'bold', [0, 210, 255])
        y += 2

        // Hashtags
        y = addText(post.hashtags.join(' '), margin, y, 7, 'normal', [100, 120, 140])
        y += 8

        // Separator
        doc.setDrawColor(20, 40, 60)
        doc.setLineWidth(0.2)
        doc.line(margin, y, pageWidth - margin, y)
        y += 6
      }

      doc.save('content-cave-calendario.pdf')
    } catch {
      console.error('Error generating PDF')
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-jarvis-400/50 bg-jarvis-700 px-4 py-2 text-sm text-gray-300 transition-all hover:border-cyan-500/30 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex gap-3">
          <button
            onClick={exportAsPdf}
            disabled={generatingPdf}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-jarvis-900 transition-all hover:bg-cyan-400 animate-pulse-cyan"
          >
            {generatingPdf ? (
              <><FileDown className="h-4 w-4 animate-spin" /> Gerando PDF...</>
            ) : (
              <><Download className="h-4 w-4" /> Baixar PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <p className="font-semibold text-cyan-400">
            Calendário Editorial — {posts.length} posts gerados pelo Jarvis
          </p>
        </div>
        <p className="mt-1 text-sm text-cyan-400/60">
          Clique em cada post para expandir. Use o botão Baixar PDF para exportar tudo formatado.
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.map((post, i) => (
          <div
            key={i}
            className={`animate-fade-in rounded-xl border transition-all ${
              expandedPost === i
                ? 'border-cyan-500/30 bg-jarvis-800'
                : 'border-jarvis-400/30 bg-jarvis-800/60 hover:border-jarvis-300'
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Post Header */}
            <button
              onClick={() => setExpandedPost(expandedPost === i ? null : i)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm font-bold text-cyan-400">
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
              <div className="border-t border-jarvis-400/20 p-5">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Copy */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        Copy do Post
                      </label>
                      <button
                        onClick={() => copyToClipboard(post.copy, i)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-cyan-400"
                      >
                        {copiedIndex === i ? (
                          <><Check className="h-3 w-3" /> Copiado!</>
                        ) : (
                          <><Copy className="h-3 w-3" /> Copiar</>
                        )}
                      </button>
                    </div>
                    <div className="rounded-lg border border-jarvis-400/20 bg-jarvis-700 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                        {post.copy}
                      </p>
                    </div>
                  </div>

                  {/* Visual Briefing */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      Briefing Visual (Designer)
                    </label>
                    <div className="rounded-lg border border-jarvis-400/20 bg-jarvis-700 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                        {post.visualBriefing}
                      </p>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      Produtos Envolvidos
                    </label>
                    <div className="rounded-lg border border-jarvis-400/20 bg-jarvis-700 p-4">
                      <p className="text-sm text-gray-300">{post.products}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      CTA (Call to Action)
                    </label>
                    <div className="rounded-lg border border-jarvis-400/20 bg-jarvis-700 p-4">
                      <p className="text-sm text-gray-300">{post.cta}</p>
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="mt-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Hashtags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((tag, j) => (
                      <span
                        key={j}
                        className="rounded-full bg-jarvis-600 border border-jarvis-400/30 px-3 py-1 text-xs text-gray-400"
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
