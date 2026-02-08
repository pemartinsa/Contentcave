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

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
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

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: planId,
            status: 'active',
            stripeSubId: session.subscription as string,
            stripeCustomerId: session.customer as string,
          },
          create: {
            userId,
            plan: planId,
            status: 'active',
            stripeSubId: session.subscription as string,
            stripeCustomerId: session.customer as string,
          },
        })

        await prisma.user.update({
          where: { id: userId },
          data: { coins },
        })
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = (invoice as unknown as { subscription: string }).subscription

      if (subId) {
        const sub = await prisma.subscription.findFirst({
          where: { stripeSubId: subId },
        })

        if (sub) {
          const coins = PLAN_COINS[sub.plan] || 100
          await prisma.user.update({
            where: { id: sub.userId },
            data: { coins },
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
