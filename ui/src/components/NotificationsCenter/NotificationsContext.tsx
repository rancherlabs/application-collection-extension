import { createDockerDesktopClient } from '@docker/extension-api-client'
import { createContext, Dispatch, useContext, useEffect, useReducer } from 'react'

export type Notification = {
  id: string,
  title: string,
  description: string,
  type: 'info' | 'progress' | 'success' | 'warning' | 'error',
  dismissed: boolean,
  timestamp: number,
  href?: string,
  actionText?: string
}

export type NotificationAction = {
  type: 'load' | 'add' | 'dismiss' | 'undismiss' | 'delete' | 'update', 
  payload: Notification | Notification[],
}

function notificationsReducer(notifications: Notification[], action: NotificationAction): Notification[] {
  const ddClient = createDockerDesktopClient()

  switch (action.type) {
    case 'load': 
      if (!Array.isArray(action.payload)) return notifications

      return action.payload as Notification[]
    case 'add':
      if (Array.isArray(action.payload) || 
        notifications.find(n => n.id === (action.payload as Notification).id)) {
        return notifications
      }

      ddClient.extension.vm?.service?.post('/notifications', action.payload)
        .catch(error => console.error(error))

      return [ ...notifications, action.payload as Notification ]
    case 'dismiss':
      if (Array.isArray(action.payload)) return notifications

      ddClient.extension.vm?.service?.put(`/notifications/${action.payload.id}`, { ...action.payload, dismissed: true })
        .catch(error => console.error(error))

      return notifications
        .map(n => { 
          if (n.id === (action.payload as Notification).id) {
            return { ...n, dismissed: true }
          }
          
          return n
        })
    case 'undismiss':
      if (Array.isArray(action.payload)) return notifications

      ddClient.extension.vm?.service?.put(`/notifications/${action.payload.id}`, { ...action.payload, dismissed: false })
        .catch(error => console.error(error))

      return notifications
        .map(n => { 
          if (n.id === (action.payload as Notification).id) {
            return { ...n, dismissed: false }
          }
          
          return n
        })
    case 'update':
      if (Array.isArray(action.payload)) return notifications

      ddClient.extension.vm?.service?.put(`/notifications/${action.payload.id}`, action.payload)
        .catch(error => console.error(error))

      return notifications
        .map(n => { 
          if (n.id === (action.payload as Notification).id) {
            return Object.assign(n, action.payload)
          }
          
          return n
        })
    case 'delete':
      if (Array.isArray(action.payload)) return notifications

      ddClient.extension.vm?.service?.delete(`/notifications/${action.payload.id}`)
        .catch(error => console.error(error))
      return notifications.filter(n => n !== action.payload)
    default:
      return notifications
  }
}

const NotificationsContext = createContext<Notification[]>([])
const NotificationsDispatchContext = createContext<Dispatch<NotificationAction>>(() => [])

export default function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const ddClient = createDockerDesktopClient()
  const [ notifications, dispatch ] = useReducer(notificationsReducer, [])

  useEffect(() => {
    ddClient.extension.vm?.service?.get('/notifications')
      .then((data) => {
        const backendNotifications = data as Notification[]
        
        if (backendNotifications.length === 0) {
          const welcomeNotification: Notification = {
            id: '-1',
            title: 'Welcome to Application Collection extension!',
            description: 'Go to https://docs.apps.rancher.io/ to learn how to get started.',
            type: 'info',
            dismissed: false,
            timestamp: new Date().getTime()
          }
          dispatch({ type: 'add', payload: welcomeNotification })
        } else {
          dispatch({ type: 'load', payload: backendNotifications })
        }
      })
      .catch(err => console.error('Unexpected error fetching notifications from backend', err))
  }, [])

  return (
    <NotificationsContext.Provider value={ notifications }>
      <NotificationsDispatchContext.Provider value={ dispatch }>
        { children }
      </NotificationsDispatchContext.Provider>
    </NotificationsContext.Provider>
  )
}

export function useNotificationsContext() {
  return useContext(NotificationsContext)
}

export function useNotificationsDispatch() {
  return useContext(NotificationsDispatchContext)
}
