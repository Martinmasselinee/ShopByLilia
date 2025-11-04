'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
}

export function useNotifications() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (status === 'loading' || !session?.user) return

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

        const response = await fetch('/api/notifications', {
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          console.error('Failed to fetch notifications:', response.status)
          return
        }

        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error('Notifications fetch timeout')
        } else {
        console.error('Error fetching notifications:', error)
        }
      }
    }

    fetchNotifications()

    // DISABLED SSE: Use polling instead to avoid Vercel serverless timeout issues
    // Poll for new notifications every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000)

    return () => {
      clearInterval(intervalId)
    }
  }, [session, status])

  return { notifications, unreadCount }
}

