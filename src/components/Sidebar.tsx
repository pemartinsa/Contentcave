'use client'

import { Flame, PenTool, FileText, LayoutGrid, Settings, Zap } from 'lucide-react'

interface SidebarProps {
  activeSection: 'form' | 'results'
  onNavigate: (section: 'form' | 'results') => void
  hasResults: boolean
}

export default function Sidebar({ activeSection, onNavigate, hasResults }: SidebarProps) {
  return (
    <aside className="flex w-72 flex-col border-r border-jarvis-400/30 bg-jarvis-800">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-jarvis-400/30 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-500/30">
          <Zap className="h-5 w-5 text-cyan-400" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          CONTENT <span className="text-cyan-400">CAVE</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
          Dashboard
        </p>

        <ul className="space-y-1">
          <SidebarItem
            icon={<PenTool className="h-4 w-4" />}
            label="Criar Conteúdo"
            active={activeSection === 'form'}
            onClick={() => onNavigate('form')}
          />
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Conteúdo Gerado"
            active={activeSection === 'results'}
            onClick={() => onNavigate('results')}
            badge={hasResults ? '✓' : undefined}
          />
        </ul>

        <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
          Ferramentas
        </p>

        <ul className="space-y-1">
          <SidebarItem
            icon={<Flame className="h-4 w-4" />}
            label="Gerador de Posts"
            active={false}
            highlight
          />
          <SidebarItem
            icon={<LayoutGrid className="h-4 w-4" />}
            label="Gerador de Carrosséis"
            active={false}
            disabled
            comingSoon
          />
          <SidebarItem
            icon={<Settings className="h-4 w-4" />}
            label="Configurações"
            active={false}
            disabled
            comingSoon
          />
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-jarvis-400/30 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <p className="text-xs text-gray-500">Jarvis Online</p>
        </div>
        <p className="mt-1 text-[10px] text-gray-700">Powered by Claude AI</p>
      </div>
    </aside>
  )
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
  badge,
  highlight,
  disabled,
  comingSoon,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick?: () => void
  badge?: string
  highlight?: boolean
  disabled?: boolean
  comingSoon?: boolean
}) {
  return (
    <li>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          active
            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
            : highlight
            ? 'text-cyan-400/70 hover:bg-jarvis-600 hover:text-cyan-400 border border-transparent'
            : disabled
            ? 'text-gray-700 cursor-not-allowed border border-transparent'
            : 'text-gray-400 hover:bg-jarvis-600 hover:text-white border border-transparent'
        }`}
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {badge && (
          <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
            {badge}
          </span>
        )}
        {comingSoon && (
          <span className="rounded bg-jarvis-500 px-2 py-0.5 text-[10px] text-gray-600">
            Em breve
          </span>
        )}
      </button>
    </li>
  )
}
