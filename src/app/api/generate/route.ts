import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 300

const CHANNEL_NAMES: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  twitter: 'X (Twitter)',
  pinterest: 'Pinterest',
  threads: 'Threads',
}

const FREQUENCY_LABELS: Record<string, string> = {
  '1_per_day': '1 post por dia',
  '2_per_day': '2 posts por dia',
  '3_per_week': '3 posts por semana',
}

function calculateTotalPosts(duration: string, frequency: string): number {
  const days = parseInt(duration)
  switch (frequency) {
    case '1_per_day': return days
    case '2_per_day': return days * 2
    case '3_per_week': return Math.ceil(days / 7) * 3
    default: {
      const match = frequency.match(/(\d+)/)
      if (match) {
        const num = parseInt(match[1])
        if (frequency.toLowerCase().includes('dia') || frequency.toLowerCase().includes('day')) {
          return days * num
        }
        if (frequency.toLowerCase().includes('semana') || frequency.toLowerCase().includes('week')) {
          return Math.ceil(days / 7) * num
        }
      }
      return Math.ceil(days / 7) * 3
    }
  }
}

interface FileData {
  name: string
  type: string
  data: string
}

interface PostResult {
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

const BATCH_SIZE = 10

function buildPrompt(params: {
  channelName: string
  duration: string
  frequencyLabel: string
  niche: string
  product: string
  contextExtra: string
  suggestion: string
  website: string
  socialProfile: string
  targetAudience: string
  batchStart: number
  batchCount: number
  totalPosts: number
}) {
  const {
    channelName, duration, frequencyLabel, niche, product, contextExtra,
    suggestion, website, socialProfile, targetAudience,
    batchStart, batchCount, totalPosts,
  } = params

  const isContinuation = batchStart > 1
  const batchNote = totalPosts > BATCH_SIZE
    ? `\n\nIMPORTANTE: Este é o lote ${Math.ceil(batchStart / BATCH_SIZE)} de ${Math.ceil(totalPosts / BATCH_SIZE)}. Gere os posts do DIA ${batchStart} ao DIA ${batchStart + batchCount - 1}. ${isContinuation ? 'Continue a narrativa e estratégia dos posts anteriores, variando temas e formatos.' : ''}`
    : ''

  return `Você é o JARVIS — sistema avançado de inteligência de conteúdo para redes sociais. Estrategista de marketing digital, copywriter elite, especialista em psicologia do consumidor.

## CONTEXTO DO CLIENTE
- **Rede social:** ${channelName}
- **Período:** ${duration} dias
- **Frequência:** ${frequencyLabel}
- **Nicho:** ${niche}
- **Produto/Serviço:** ${product}${contextExtra}
${suggestion ? `- **Direcionamento:** ${suggestion}` : ''}
${website ? `- **Website:** ${website}` : ''}
${socialProfile ? `- **Perfil social:** ${socialProfile}` : ''}
${targetAudience ? '' : `\nDefina o público ideal para o nicho "${niche}" e produto "${product}".`}

## DIRETRIZES
- **30%** Educativo → Autoridade
- **25%** Prova Social/Storytelling
- **20%** Entretenimento/Tendências
- **15%** Venda Direta → CTA forte
- **10%** Conexão/Humanização

### COPIES
- Hook poderoso na 1ª linha (PARE O SCROLL)
- Storytelling, linguagem conversacional
- Emojis estratégicos, quebras de linha
- CTA claro e específico
- Tom nativo do ${channelName}
- Mínimo 150 palavras por copy

### BRIEFING VISUAL
- Tipo (foto, carrossel, reels), paleta de cores, elementos, texto na arte, estilo, composição

## FORMATO JSON
Retorne APENAS JSON válido, sem markdown:
{
  "posts": [
    {
      "day": ${batchStart},
      "date": "Dia ${batchStart} - Segunda-feira",
      "theme": "Educativo | Prova Social | Entretenimento | Venda | Conexão",
      "title": "Título magnético",
      "copy": "Copy COMPLETA pronta para publicar, mín 150 palavras, com emojis e \\n",
      "visualBriefing": "Descrição detalhada para designer: tipo, cores, elementos, texto, formato (1080x1080 etc)",
      "products": "Produtos relacionados",
      "cta": "CTA específico e acionável",
      "format": "Carrossel | Post Único | Reels | Stories | Vídeo",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
    }
  ]
}

Crie exatamente ${batchCount} posts (dia ${batchStart} ao ${batchStart + batchCount - 1}).${batchNote}

SOMENTE JSON. Varie formatos. Hashtags mix alta/baixa competição. Briefing visual executável sem perguntas.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      channel, duration, frequency, niche, suggestion, product,
      businessName, targetAudience, website, socialProfile,
      files,
    } = body

    if (!channel || !duration || !frequency || !niche) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos.' },
        { status: 400 }
      )
    }

    // Product text or files required
    const hasProduct = (product && product.trim()) || (files && files.length > 0)
    if (!hasProduct) {
      return NextResponse.json(
        { error: 'Informe o que você vende ou anexe um arquivo.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave da API não configurada. Adicione ANTHROPIC_API_KEY no .env.local' },
        { status: 500 }
      )
    }

    const client = new Anthropic({ apiKey })
    const totalPosts = calculateTotalPosts(duration, frequency)
    const channelName = CHANNEL_NAMES[channel] || channel
    const frequencyLabel = FREQUENCY_LABELS[frequency] || frequency
    const postsToGenerate = Math.min(totalPosts, 60)

    // Build file content blocks (only for first batch)
    const fileBlocks: Anthropic.Messages.ContentBlockParam[] = []
    const MAX_FILE_BASE64 = 8 * 1024 * 1024 // 8MB base64
    const MAX_FILES = 3

    if (files && Array.isArray(files)) {
      const filesToProcess = (files as FileData[]).slice(0, MAX_FILES)
      for (const file of filesToProcess) {
        const base64Data = file.data.split(',')[1]
        if (!base64Data || base64Data.length > MAX_FILE_BASE64) continue

        if (file.type.startsWith('image/')) {
          const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
          fileBlocks.push({
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Data },
          })
          fileBlocks.push({
            type: 'text',
            text: `[IMAGEM: ${file.name}] Analise: produto, características, embalagem, cores, público-alvo, texto visível.`,
          })
        } else if (file.type === 'application/pdf') {
          fileBlocks.push({
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64Data },
          })
          fileBlocks.push({
            type: 'text',
            text: `[PDF: ${file.name}] Analise: todos os produtos, benefícios, ingredientes, preços.`,
          })
        }
      }
    }

    // Build context
    let contextExtra = ''
    if (businessName) contextExtra += `\n- **Nome do negócio:** ${businessName}`
    if (targetAudience) contextExtra += `\n- **Público-alvo:** ${targetAudience}`

    const promptParams = {
      channelName, duration, frequencyLabel, niche,
      product: product || '(ver arquivos anexados)',
      contextExtra, suggestion: suggestion || '',
      website: website || '', socialProfile: socialProfile || '',
      targetAudience: targetAudience || '',
    }

    // Generate in batches
    const allPosts: PostResult[] = []
    const batches: { start: number; count: number }[] = []

    for (let i = 0; i < postsToGenerate; i += BATCH_SIZE) {
      batches.push({
        start: i + 1,
        count: Math.min(BATCH_SIZE, postsToGenerate - i),
      })
    }

    for (const batch of batches) {
      const promptText = buildPrompt({
        ...promptParams,
        batchStart: batch.start,
        batchCount: batch.count,
        totalPosts: postsToGenerate,
      })

      // Only include file blocks in the first batch
      const contentBlocks: Anthropic.Messages.ContentBlockParam[] = []
      if (batch.start === 1 && fileBlocks.length > 0) {
        contentBlocks.push(...fileBlocks)
      }
      contentBlocks.push({ type: 'text', text: promptText })

      const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 16000,
        messages: [{ role: 'user', content: contentBlocks }],
      })

      const textContent = message.content.find(block => block.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('Resposta vazia da IA')
      }

      let responseText = textContent.text.trim()
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }

      const parsed = JSON.parse(responseText)
      if (parsed.posts && Array.isArray(parsed.posts)) {
        allPosts.push(...parsed.posts)
      }
    }

    if (allPosts.length === 0) {
      throw new Error('Nenhum post foi gerado')
    }

    return NextResponse.json({ posts: allPosts })
  } catch (err: unknown) {
    console.error('Generation error:', err)
    let message = 'Erro interno'
    if (err instanceof Anthropic.APIError) {
      if (err.status === 413) {
        message = 'Requisição muito grande. Tente remover arquivos anexados ou reduzir o tamanho das imagens/PDFs.'
      } else if (err.status === 429) {
        message = 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.'
      } else if (err.status === 401) {
        message = 'Chave da API inválida. Verifique sua ANTHROPIC_API_KEY.'
      } else {
        message = err.message || 'Erro na API de IA'
      }
    } else if (err instanceof SyntaxError) {
      message = 'Erro ao processar resposta da IA. Tente novamente.'
    } else if (err instanceof Error) {
      message = err.message
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
