'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CreditCard,
  Check,
  Crown,
  Zap,
  Rocket,
  Building2,
  Shield,
  Star,
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: string
  priceValue: number
  period: string
  icon: React.ReactNode
  color: string
  borderColor: string
  bgColor: string
  features: string[]
  coins: number
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    priceValue: 0,
    period: '/mês',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-gray-400',
    borderColor: 'border-jarvis-400/30',
    bgColor: 'bg-jarvis-700/50',
    coins: 100,
    features: [
      '100 coins por mês',
      '1 geração por vez',
      'Até 7 posts por geração',
      'Export PDF básico',
      'Suporte por email',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 49,90',
    priceValue: 4990,
    period: '/mês',
    icon: <Rocket className="h-6 w-6" />,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/5',
    coins: 500,
    features: [
      '500 coins por mês',
      'Gerações ilimitadas',
      'Até 30 posts por geração',
      'Export PDF completo',
      'Suporte prioritário',
      'Análise de website',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 99,90',
    priceValue: 9990,
    period: '/mês',
    icon: <Crown className="h-6 w-6" />,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/5',
    coins: 2000,
    popular: true,
    features: [
      '2.000 coins por mês',
      'Gerações ilimitadas',
      'Até 60 posts por geração',
      'Export PDF premium',
      'Suporte 24/7',
      'Análise de website + redes',
      'Upload de catálogos',
      'Gerador de carrosséis',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 249,90',
    priceValue: 24990,
    period: '/mês',
    icon: <Building2 className="h-6 w-6" />,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/5',
    coins: 10000,
    features: [
      '10.000 coins por mês',
      'Tudo do Pro',
      'Múltiplos usuários',
      'API access',
      'White-label',
      'Gerente de conta dedicado',
      'Integrações personalizadas',
      'SLA garantido',
    ],
  },
]

export default function BillingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState('free')
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      setCurrentPlan((session.user as { plan?: string }).plan || 'free')
    }
  }, [session])

  const handleSubscribe = async (planId: string) => {
    if (planId === currentPlan) return
    if (planId === 'free') return

    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erro ao processar pagamento')
      }
    } catch {
      alert('Erro de conexão')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-jarvis-900">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,210,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 rounded-lg border border-jarvis-400/50 bg-jarvis-700 px-4 py-2 text-sm text-gray-300 transition-all hover:border-cyan-500/30 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Cobranças e <span className="text-cyan-400">Pagamento</span>
            </h1>
            <p className="text-sm text-gray-500">
              Gerencie sua assinatura e método de pagamento
            </p>
          </div>
        </div>

        {/* Current Plan Banner */}
        <div className="mb-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
                <Star className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Plano atual</p>
                <p className="text-lg font-bold text-cyan-400 uppercase">
                  {currentPlan}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Shield className="h-4 w-4" />
              Pagamento seguro via Stripe
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border ${
                plan.popular
                  ? 'border-yellow-500/40 bg-jarvis-800 shadow-lg shadow-yellow-500/5'
                  : `${plan.borderColor} bg-jarvis-800/80`
              } p-6 transition-all hover:border-cyan-500/30`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-500 px-4 py-1 text-xs font-bold text-jarvis-900">
                  MAIS POPULAR
                </div>
              )}

              {/* Icon & Name */}
              <div className={`mb-4 flex items-center gap-3 ${plan.color}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${plan.borderColor} ${plan.bgColor}`}>
                  {plan.icon}
                </div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-5">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.period}</span>
                <p className="mt-1 text-xs text-gray-600">
                  {plan.coins.toLocaleString('pt-BR')} coins incluídos
                </p>
              </div>

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.color}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {currentPlan === plan.id ? (
                <button
                  disabled
                  className="w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10 py-3 text-sm font-semibold text-cyan-400"
                >
                  Plano Atual
                </button>
              ) : plan.id === 'free' ? (
                <button
                  disabled
                  className="w-full rounded-lg border border-jarvis-400/30 bg-jarvis-700 py-3 text-sm font-medium text-gray-500"
                >
                  Plano Gratuito
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-all ${
                    plan.popular
                      ? 'bg-yellow-500 text-jarvis-900 hover:bg-yellow-400'
                      : 'bg-cyan-500 text-jarvis-900 hover:bg-cyan-400'
                  } disabled:opacity-50`}
                >
                  {loading === plan.id ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-jarvis-900 border-t-transparent" />
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Assinar {plan.name}
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Payment info */}
        <div className="mt-8 rounded-xl border border-jarvis-400/20 bg-jarvis-800/60 p-6">
          <h3 className="mb-3 text-sm font-semibold text-white">Informações de Pagamento</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-sm font-medium text-gray-300">Cartão de Crédito</p>
                <p className="text-xs text-gray-600">Visa, Mastercard, Elo, Amex</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-sm font-medium text-gray-300">100% Seguro</p>
                <p className="text-xs text-gray-600">Processado pelo Stripe (PCI DSS)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-sm font-medium text-gray-300">Cancele quando quiser</p>
                <p className="text-xs text-gray-600">Sem multa, sem fidelidade</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
