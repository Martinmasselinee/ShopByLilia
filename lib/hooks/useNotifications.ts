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
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session?.user) return

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    fetchNotifications()

    // Set up SSE connection for real-time updates
    const eventSource = new EventSource('/api/notifications/stream')

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'notifications') {
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [session])

  return { notifications, unreadCount }
}

