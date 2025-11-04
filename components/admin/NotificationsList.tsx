'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
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
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  useEffect(() => {
    // Wait for session to be loaded before fetching
    if (status === 'loading') {
      return
    }

    if (!session) {
      setIsLoading(false)
      return
    }

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
  }, [session, status])

  const filteredNotifications = showUnreadOnly
    ? notifications.filter(n => !n.read)
    : notifications

  const getActionButton = (notification: Notification) => {
    if (!notification.user?.id) return null

    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors text-sm min-h-[44px] flex items-center justify-center whitespace-nowrap"

    switch (notification.type) {
      case 'NEW_PHOTO_UPLOADED':
        return {
          text: 'Voir les photos',
          href: `/admin/echanges/${notification.user.id}`,
          classes: `${baseClasses} bg-primary text-white hover:opacity-90`
        }
      case 'PROPOSITION_RESPONSE':
        return {
          text: 'Voir l\'échange',
          href: `/admin/echanges/${notification.user.id}`,
          classes: `${baseClasses} bg-primary text-white hover:opacity-90`
        }
      case 'PIECES_ORDER_UPDATED':
        return {
          text: 'Voir le profil',
          href: `/admin/clients`,
          classes: `${baseClasses} bg-accent text-text hover:bg-accent/70`
        }
      default:
        return null
    }
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
        {filteredNotifications.map((notification) => {
          const actionButton = getActionButton(notification)
          
          return (
            <div
            key={notification.id}
              className={`p-4 rounded-lg border transition-colors min-h-[44px] ${
              notification.read
                  ? 'bg-white border-accent'
                  : 'bg-primary/5 border-primary/20'
            }`}
          >
            <div className="flex items-start space-x-3">
              {notification.user?.profilePhoto && (
                <Image
                  src={notification.user.profilePhoto}
                  alt={notification.user.fullName}
                  width={40}
                  height={40}
                    className="rounded-full flex-shrink-0"
                />
              )}
                <div className="flex-1 min-w-0">
                <p className="text-text font-medium">{notification.message}</p>
                <p className="text-sm text-text/60 mt-1">
                  {new Date(notification.createdAt).toLocaleString('fr-FR')}
                </p>
                  
                  {/* Action button */}
                  {actionButton && (
                    <div className="mt-3">
                      <Link
                        href={actionButton.href}
                        className={actionButton.classes}
                      >
                        {actionButton.text}
                      </Link>
                    </div>
                  )}
                </div>
                {!notification.read && (
                  <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12 text-text/60">
          Aucune notification
        </div>
      )}
    </div>
  )
}

