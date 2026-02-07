'use client'

import { useState } from 'react'
import { Coins, Plus, X } from 'lucide-react'

const COIN_PACKAGES = [
  { coins: 50, price: 'R$ 19,90', popular: false },
  { coins: 150, price: 'R$ 49,90', popular: true },
  { coins: 500, price: 'R$ 129,90', popular: false },
]

interface CoinDisplayProps {
  coins: number
  onPurchase: (amount: number) => void
}

export default function CoinDisplay({ coins, onPurchase }: CoinDisplayProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group relative flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/5 px-4 py-2 transition-all hover:border-gold-500/50 hover:bg-gold-500/10"
      >
        {/* Shine effect */}
        <div className="animate-coin-shine absolute inset-0 rounded-full" />

        <div className="relative flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/20">
            <Coins className="h-3.5 w-3.5 text-gold-500" />
          </div>
          <span className="text-sm font-bold text-gold-500">{coins}</span>
          <span className="text-xs text-gold-500/60">coins</span>
        </div>

        <div className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500/20 transition-all group-hover:bg-gold-500/30">
          <Plus className="h-3 w-3 text-gold-500" />
        </div>
      </button>

      {/* Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-jarvis-400 bg-jarvis-800 p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20">
                <Coins className="h-6 w-6 text-gold-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Comprar Coins</h3>
              <p className="mt-1 text-sm text-gray-400">
                Você tem <span className="font-bold text-gold-500">{coins} coins</span> restantes
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Cada geração de conteúdo consome ~10 coins
              </p>
            </div>

            <div className="space-y-3">
              {COIN_PACKAGES.map((pkg) => (
                <button
                  key={pkg.coins}
                  onClick={() => {
                    onPurchase(pkg.coins)
                    setShowModal(false)
                  }}
                  className={`relative flex w-full items-center justify-between rounded-xl border p-4 transition-all ${
                    pkg.popular
                      ? 'border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10'
                      : 'border-jarvis-400 bg-jarvis-700 hover:border-jarvis-300'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 right-4 rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-bold text-jarvis-900">
                      POPULAR
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      pkg.popular ? 'bg-cyan-500/20' : 'bg-gold-500/10'
                    }`}>
                      <Coins className={`h-5 w-5 ${pkg.popular ? 'text-cyan-400' : 'text-gold-500'}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">{pkg.coins} Coins</p>
                      <p className="text-xs text-gray-500">
                        ~{Math.floor(pkg.coins / 10)} gerações
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${pkg.popular ? 'text-cyan-400' : 'text-gray-300'}`}>
                    {pkg.price}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-[10px] text-gray-600">
              Coins são inclusos no plano mensal. Compras adicionais ficam disponíveis imediatamente.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
