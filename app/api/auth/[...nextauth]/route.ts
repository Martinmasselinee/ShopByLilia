import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

console.log('[NEXTAUTH ROUTE] Initializing NextAuth handler...')
console.log('[NEXTAUTH ROUTE] NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('[NEXTAUTH ROUTE] NEXTAUTH_SECRET configured:', !!process.env.NEXTAUTH_SECRET)

const handler = NextAuth(authOptions)

export const GET = handler
export const POST = handler

