'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Zap, Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          setError('As senhas não coincidem')
          setLoading(false)
          return
        }
        if (form.password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres')
          setLoading(false)
          return
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erro ao criar conta')
          setLoading(false)
          return
        }

        // Auto-login after registration
        const result = await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        })

        if (result?.error) {
          setError('Conta criada! Faça login.')
          setMode('login')
          setLoading(false)
          return
        }

        router.push('/')
      } else {
        const result = await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        })

        if (result?.error) {
          setError('Email ou senha incorretos')
          setLoading(false)
          return
        }

        router.push('/')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-jarvis-900">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,210,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glow */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />
        {/* Corner accents */}
        <div className="absolute left-4 top-4 h-20 w-20 border-l-2 border-t-2 border-cyan-500/10 rounded-tl-lg" />
        <div className="absolute right-4 top-4 h-20 w-20 border-r-2 border-t-2 border-cyan-500/10 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 h-20 w-20 border-b-2 border-l-2 border-cyan-500/10 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 h-20 w-20 border-b-2 border-r-2 border-cyan-500/10 rounded-br-lg" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
            <Zap className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            CONTENT <span className="text-cyan-400">CAVE</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Powered by <span className="animate-glow-text text-cyan-400/80">J.A.R.V.I.S</span>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-jarvis-400/30 bg-jarvis-800/80 p-8 backdrop-blur-sm">
          {/* Mode toggle */}
          <div className="mb-6 flex rounded-lg bg-jarvis-700 p-1">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMode('register'); setError('') }}
              className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Seu nome"
                    className="w-full rounded-lg border border-jarvis-400/30 bg-jarvis-700 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-jarvis-400/30 bg-jarvis-700 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-jarvis-400/30 bg-jarvis-700 py-3 pl-10 pr-10 text-sm text-white placeholder-gray-600 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-jarvis-400/30 bg-jarvis-700 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-3 text-sm font-bold text-jarvis-900 transition-all hover:bg-cyan-400 disabled:opacity-50 animate-pulse-cyan"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-jarvis-900 border-t-transparent" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-700">
            <Shield className="h-3.5 w-3.5" />
            <span>Dados protegidos com criptografia</span>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-700">
          Content Cave &copy; {new Date().getFullYear()} — Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
