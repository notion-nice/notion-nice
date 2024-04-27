import NextAuth from 'next-auth'
import Notion from '@/lib//providers/notion'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default NextAuth({
  providers: [
    Notion({
      clientId: process.env.AUTH_NOTION_ID,
      clientSecret: process.env.AUTH_NOTION_SECRET,
      redirectUri: process.env.AUTH_NOTION_REDIRECT_URI
    }) as any
  ],
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/signin'
  }
})
