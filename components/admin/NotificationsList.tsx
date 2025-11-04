'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
  user?: {
    id: string
    fullName: string
    profilePhoto: string | null
  }
}

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  useEffect(() => {
    fetch(`/api/notifications?adminOnly=true`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])

  const filteredNotifications = showUnreadOnly
    ? notifications.filter(n => !n.read)
    : notifications

  const getNotificationLink = (notification: Notification) => {
    if (notification.user?.id) {
      return `/admin/echanges/${notification.user.id}`
    }
    return '/admin/clients'
  }

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-text">Notifications</h2>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="w-5 h-5 rounded border-accent text-primary focus:ring-primary"
          />
          <span className="text-sm text-text/80">Non lues uniquement</span>
        </label>
      </div>

      <div className="space-y-2">
        {filteredNotifications.map((notification) => (
          <Link
            key={notification.id}
            href={getNotificationLink(notification)}
            className={`block p-4 rounded-lg border transition-colors min-h-[44px] ${
              notification.read
                ? 'bg-white border-accent hover:bg-accent/30'
                : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
            }`}
          >
            <div className="flex items-start space-x-3">
              {notification.user?.profilePhoto && (
                <Image
                  src={notification.user.profilePhoto}
                  alt={notification.user.fullName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="text-text font-medium">{notification.message}</p>
                <p className="text-sm text-text/60 mt-1">
                  {new Date(notification.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              {!notification.read && (
                <div className="w-3 h-3 bg-primary rounded-full"></div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12 text-text/60">
          Aucune notification
        </div>
      )}
    </div>
  )
}

