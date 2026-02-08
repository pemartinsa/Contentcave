import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
  })
}

const PLAN_PRICES: Record<string, { amount: number; name: string; coins: number }> = {
  starter: { amount: 4990, name: 'Content Cave Starter', coins: 500 },
  pro: { amount: 9990, name: 'Content Cave Pro', coins: 2000 },
  enterprise: { amount: 24990, name: 'Content Cave Enterprise', coins: 10000 },
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe()
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { planId } = await req.json()
    const plan = PLAN_PRICES[planId]

    if (!plan) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    const userId = (session.user as { id: string }).id

    // Get or create Stripe customer
    let sub = await prisma.subscription.findUnique({ where: { userId } })

    let customerId = sub?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name || undefined,
        metadata: { userId },
      })
      customerId = customer.id

      if (sub) {
        await prisma.subscription.update({
          where: { userId },
          data: { stripeCustomerId: customerId },
        })
      }
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: plan.name,
              description: `${plan.coins.toLocaleString('pt-BR')} coins/mês`,
            },
            unit_amount: plan.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/billing?success=true`,
      cancel_url: `${baseUrl}/billing?canceled=true`,
      metadata: {
        userId,
        planId,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: 'Erro ao criar sessão de pagamento' },
      { status: 500 }
    )
  }
}
