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
}

function calculateTotalPosts(duration: string, frequency: string): number {
  const days = parseInt(duration)
  switch (frequency) {
    case '1_per_day': return days
    case '2_per_day': return days * 2
    case '3_per_week': return Math.ceil(days / 7) * 3
    default: {
      // Try to parse custom frequencies
      const match = frequency.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1])
        if (frequency.toLowerCase().includes('dia') || frequency.toLowerCase().includes('day')) {
          return days * num
        }
        if (frequency.toLowerCase().includes('semana') || frequency.toLowerCase().includes('week')) {
          return Math.ceil(days / 7) * num
        }
      }
      return Math.ceil(days / 7) * 3 // fallback
    }
  }
}

interface FileData {
  name: string
  type: string
  data: string // base64 data URL
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      channel, duration, frequency, niche, suggestion, product,
      businessName, targetAudience, website, socialProfile,
      files,
    } = body

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
    const postsToGenerate = Math.min(totalPosts, 30)

    // Build content blocks for multimodal message
    const contentBlocks: Anthropic.Messages.ContentBlockParam[] = []

    // Process uploaded files - images sent as vision, PDFs described
    const fileDescriptions: string[] = []
    if (files && Array.isArray(files)) {
      for (const file of files as FileData[]) {
        if (file.type.startsWith('image/')) {
          // Send image for vision analysis
          const base64Data = file.data.split(',')[1]
          const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
          contentBlocks.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data,
            },
          })
          contentBlocks.push({
            type: 'text',
            text: `[IMAGEM DO PRODUTO: ${file.name}] Analise esta imagem detalhadamente - identifique o produto, características visuais, embalagem, cores, público-alvo aparente, e qualquer texto visível.`,
          })
        } else if (file.type === 'application/pdf') {
          // For PDFs, extract base64 and send as document
          const base64Data = file.data.split(',')[1]
          contentBlocks.push({
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64Data,
            },
          })
          contentBlocks.push({
            type: 'text',
            text: `[CATÁLOGO PDF: ${file.name}] Analise este documento por completo - identifique todos os produtos, benefícios, ingredientes/nutrientes, preços, e informações relevantes para criar conteúdo.`,
          })
        }
      }
    }

    // Build context sections
    let contextExtra = ''
    if (businessName) contextExtra += `\n- **Nome do negócio:** ${businessName}`
    if (targetAudience) contextExtra += `\n- **Público-alvo definido:** ${targetAudience}`
    if (website) contextExtra += `\n- **Website:** ${website} (considere a presença online do negócio)`
    if (socialProfile) contextExtra += `\n- **Perfil social:** ${socialProfile} (considere o conteúdo já publicado)`

    const mainPrompt = `Você é o JARVIS — o mais avançado sistema de inteligência de conteúdo para redes sociais. Você é um estrategista de marketing digital de nível mundial, copywriter elite, e especialista em psicologia do consumidor.

## SUA MISSÃO
Criar um calendário editorial EXCEPCIONAL que vai transformar o perfil do cliente em uma máquina de engajamento e vendas.

## CONTEXTO DO CLIENTE
- **Rede social principal:** ${channelName}
- **Período:** ${duration} dias
- **Frequência:** ${frequencyLabel}
- **Nicho:** ${niche}
- **Produto/Serviço:** ${product}${contextExtra}
${suggestion ? `- **Direcionamento do cliente:** ${suggestion}` : ''}
${fileDescriptions.length > 0 ? `\n## ANÁLISE DE ARQUIVOS\n${fileDescriptions.join('\n')}` : ''}
${website ? `\n## ANÁLISE DO WEBSITE\nO cliente possui o site ${website}. Considere que ele já tem uma presença digital e use isso para criar conteúdo alinhado com sua comunicação atual.` : ''}
${socialProfile ? `\n## DIAGNÓSTICO DE REDE SOCIAL\nO cliente tem o perfil ${socialProfile}. Faça um diagnóstico rápido do que ele provavelmente já publica e sugira melhorias através do conteúdo que você vai criar. O novo conteúdo deve elevar o nível do que ele já faz.` : ''}
${targetAudience ? '' : `\n## DEFINIÇÃO DE PÚBLICO\nComo o cliente não definiu público-alvo, analise o nicho "${niche}" e o produto "${product}" para definir o público ideal. Considere demographics, psychographics, dores, desejos e comportamento de compra.`}

## DIRETRIZES ESTRATÉGICAS

### 1. FRAMEWORK DE CONTEÚDO
Distribua os posts seguindo esta estrutura ao longo do período:
- **30% Educativo/Valor** → Posiciona como autoridade. Ensine algo útil.
- **25% Prova Social/Storytelling** → Depoimentos, bastidores, cases de sucesso
- **20% Entretenimento/Tendências** → Memes do nicho, trends adaptadas, conteúdo viral
- **15% Venda Direta** → CTA forte, oferta, escassez, urgência
- **10% Conexão/Humanização** → Bastidores, dia a dia, vulnerabilidade estratégica

### 2. GATILHOS MENTAIS (use em TODAS as copies)
- Urgência e Escassez (ofertas limitadas, vagas acabando)
- Prova Social (números, depoimentos, resultados)
- Autoridade (dados, pesquisas, experiência)
- Reciprocidade (entregue valor genuíno antes de pedir algo)
- Antecipação (crie expectativa para o próximo conteúdo)
- Identificação (fale a língua do público, use suas dores e desejos)

### 3. COPIES QUE CONVERTEM
- Hook poderoso na primeira linha (PARE O SCROLL)
- Storytelling quando possível
- Linguagem conversacional, como se falasse com um amigo
- Emojis estratégicos (não exagere, mas use para quebrar texto)
- Quebras de linha para facilitar leitura
- CTA claro e específico no final
- Adapte o tom para ${channelName}

### 4. BRIEFING VISUAL PROFISSIONAL
Para cada post, descreva EXATAMENTE:
- Tipo de imagem/vídeo (foto, ilustração, carrossel, reels)
- Paleta de cores sugerida
- Elementos visuais obrigatórios
- Texto que deve aparecer na arte (se houver)
- Referência de estilo (clean, bold, minimalista, etc)
- Composição e layout

### 5. CTAs ESTRATÉGICOS
Cada CTA deve ser:
- Específico (não genérico como "saiba mais")
- Alinhado com o objetivo do post
- Fácil de executar (1 passo)
- Criar senso de movimento/progressão

## FORMATO DE RESPOSTA
Retorne APENAS um JSON válido, sem markdown, sem texto extra:

{
  "posts": [
    {
      "day": 1,
      "date": "Dia 1 - Segunda-feira",
      "theme": "Educativo | Prova Social | Entretenimento | Venda | Conexão",
      "title": "Título magnético que prende atenção",
      "copy": "A copy COMPLETA do post, pronta para copiar e colar na rede social. Mínimo 150 palavras. Inclua emojis, quebras de linha (\\n), hashtags no final se aplicável, e todo o texto da legenda. Deve ser PUBLICÁVEL imediatamente.",
      "visualBriefing": "Descrição ultra-detalhada para o designer: tipo de arte, cores exatas, elementos, texto na imagem, estilo, composição, formato (1080x1080, 1080x1350, 9:16 para reels), referências visuais.",
      "products": "Produto(s) ou serviço(s) relacionados ao post",
      "cta": "Call to Action específico, poderoso e acionável",
      "format": "Carrossel | Post Único | Reels | Stories | Vídeo Longo",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
    }
  ]
}

Crie exatamente ${postsToGenerate} posts.

REGRAS CRÍTICAS:
- SOMENTE JSON na resposta, sem nenhum texto antes ou depois
- Copies com MÍNIMO 150 palavras cada - prontas para publicar
- VARIE os formatos ao longo do calendário
- Hashtags: mix de alta competição (alcance) e baixa competição (nicho)
- Cada post deve ter um propósito estratégico claro
- O conjunto de posts deve contar uma história progressiva
- Briefing visual detalhado o suficiente para UM DESIGNER EXECUTAR SEM PERGUNTAS`

    // Add the main prompt
    contentBlocks.push({ type: 'text', text: mainPrompt })

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
