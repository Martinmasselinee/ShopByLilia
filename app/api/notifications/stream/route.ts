import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return new NextResponse('Non authentifié', { status: 401 })
  }

  // Set up Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`))

      // Poll for new notifications every 5 seconds
      const interval = setInterval(async () => {
        try {
          let notifications
          
          if (session.user.role === 'ADMIN') {
            notifications = await prisma.notification.findMany({
              where: { adminId: { not: null }, read: false },
              take: 10,
              orderBy: { createdAt: 'desc' },
            })
          } else {
            notifications = await prisma.notification.findMany({
              where: { userId: session.user.id, read: false },
              take: 10,
              orderBy: { createdAt: 'desc' },
            })
          }

          if (notifications.length > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'notifications', notifications })}\n\n`)
            )
          }
        } catch (error) {
          console.error('Error in SSE stream:', error)
        }
      }, 5000)

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

