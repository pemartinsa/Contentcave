import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { subscription: true },
        })

        if (!user) {
          throw new Error('Email ou senha incorretos')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Email ou senha incorretos')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          coins: user.coins,
          plan: user.subscription?.plan || 'free',
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.coins = (user as unknown as { coins: number }).coins
        token.plan = (user as unknown as { plan: string }).plan
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string
        ;(session.user as { coins: number }).coins = token.coins as number
        ;(session.user as { plan: string }).plan = token.plan as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'contentcave-jarvis-secret-key-change-in-production',
}
