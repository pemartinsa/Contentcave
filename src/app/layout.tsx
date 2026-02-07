import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Content Cave | AI Copywriting Tool',
  description: 'Gere conteúdo profissional para redes sociais com inteligência artificial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
