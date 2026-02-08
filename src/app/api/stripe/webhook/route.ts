import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
  })
}

const PLAN_COINS: Record<string, number> = {
  starter: 500,
  pro: 2000,
  enterprise: 10000,
}

export async function POST(req: Request) {
  const stripe = getStripe()
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId

      if (userId && planId) {
        const coins = PLAN_COINS[planId] || 100
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.toString() || null
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.toString() || null

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: planId,
            status: 'active',
            stripeSubId: subscriptionId,
            stripeCustomerId: customerId,
          },
          create: {
            userId,
            plan: planId,
            status: 'active',
            stripeSubId: subscriptionId,
            stripeCustomerId: customerId,
          },
        })

        // Increment coins instead of overwriting
        await prisma.user.update({
          where: { id: userId },
          data: { coins: { increment: coins } },
        })
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = (invoice as unknown as { subscription: string | null }).subscription

      if (subId) {
        const sub = await prisma.subscription.findFirst({
          where: { stripeSubId: subId },
        })

        if (sub) {
          const coins = PLAN_COINS[sub.plan] || 100
          // Increment coins on renewal instead of overwriting
          await prisma.user.update({
            where: { id: sub.userId },
            data: { coins: { increment: coins } },
          })
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: 'active',
              currentPeriodEnd: invoice.lines?.data?.[0]?.period?.end
                ? new Date(invoice.lines.data[0].period.end * 1000)
                : undefined,
            },
          })
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubId: subscription.id },
      })

      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            plan: 'free',
            status: 'canceled',
            stripeSubId: null,
          },
        })
        await prisma.user.update({
          where: { id: sub.userId },
          data: { coins: 100 },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
