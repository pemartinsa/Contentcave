import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

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
  '5_per_week': '5 posts por semana',
}

function calculateTotalPosts(duration: string, frequency: string): number {
  const days = parseInt(duration)
  switch (frequency) {
    case '1_per_day': return days
    case '2_per_day': return days * 2
    case '3_per_week': return Math.ceil(days / 7) * 3
    case '5_per_week': return Math.ceil(days / 7) * 5
    default: return days
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, duration, frequency, niche, suggestion, product } = body

    if (!channel || !duration || !frequency || !niche || !product) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos.' },
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

    // Cap at 30 posts max per request to avoid timeouts
    const postsToGenerate = Math.min(totalPosts, 30)

    const prompt = `Você é um especialista em marketing digital e copywriting para redes sociais. Sua tarefa é criar um calendário editorial completo e profissional.

## CONTEXTO DO CLIENTE
- **Rede social principal:** ${channelName}
- **Período:** ${duration} dias
- **Frequência:** ${frequencyLabel}
- **Nicho:** ${niche}
- **Produto/Serviço:** ${product}
${suggestion ? `- **Direcionamento adicional:** ${suggestion}` : ''}

## INSTRUÇÕES
Crie exatamente ${postsToGenerate} posts seguindo estas diretrizes:

1. **Pesquise tendências** atuais do nicho "${niche}" no ${channelName}
2. **Varie os tipos de conteúdo**: educativo, entretenimento, prova social, bastidores, storytelling, CTA direto, carrossel informativo, vídeo curto, etc.
3. **Use gatilhos mentais**: urgência, escassez, autoridade, reciprocidade, prova social
4. **Adapte o tom** para o ${channelName} - linguagem nativa da plataforma
5. **Crie copies completas** - não resumos, copies prontas para publicar
6. **Inclua briefing visual detalhado** para o designer poder criar a arte
7. **Monte CTAs estratégicos** que guiem o público para a ação desejada

## FORMATO DE RESPOSTA
Retorne APENAS um JSON válido, sem markdown, sem texto extra, no seguinte formato:

{
  "posts": [
    {
      "day": 1,
      "date": "Dia 1 - Segunda",
      "theme": "Tema do post (ex: Educativo, Prova Social, Entretenimento)",
      "title": "Título chamativo do post",
      "copy": "A copy completa do post, pronta para publicar. Inclua emojis, quebras de linha, e todo o texto da legenda.",
      "visualBriefing": "Descrição detalhada para o designer: cores, elementos visuais, estilo de foto/arte, texto na imagem, formato (carrossel/single/reels), referência de estilo.",
      "products": "Produto ou serviço mencionado/relacionado ao post",
      "cta": "Call to Action específico do post",
      "format": "Formato: Carrossel | Post Único | Reels | Stories | Vídeo",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
    }
  ]
}

IMPORTANTE:
- Retorne SOMENTE o JSON, sem nenhum texto antes ou depois
- Cada copy deve ter no mínimo 150 palavras
- Varie os formatos de conteúdo ao longo do calendário
- As hashtags devem ser relevantes e misturar alta e baixa concorrência
- O briefing visual deve ser detalhado o suficiente para um designer criar a arte`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Resposta vazia da IA')
    }

    let responseText = textContent.text.trim()

    // Clean up if wrapped in markdown code block
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(responseText)

    if (!parsed.posts || !Array.isArray(parsed.posts)) {
      throw new Error('Formato de resposta inválido')
    }

    return NextResponse.json({ posts: parsed.posts })
  } catch (err: unknown) {
    console.error('Generation error:', err)
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
