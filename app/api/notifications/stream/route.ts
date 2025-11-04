import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// SSE (Server-Sent Events) is DISABLED for Vercel deployments
// Reason: Vercel serverless functions have a maximum execution time (60s)
// and SSE connections need to stay open indefinitely, causing 504 timeouts.
// 
// SOLUTION: The useNotifications hook now uses polling (fetch every 30s) instead of SSE
// This endpoint returns a 501 Not Implemented to avoid timeout errors

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Return 501 Not Implemented instead of timing out
  return NextResponse.json(
    { 
      error: 'SSE désactivé sur Vercel. Utilisez le polling régulier via /api/notifications.',
      message: 'Server-Sent Events are disabled on Vercel serverless. Use regular polling instead.'
    }, 
    { status: 501 }
  )
}

