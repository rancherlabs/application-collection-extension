import { createContext, Dispatch, useContext, useReducer } from 'react'

export type Notification = {
  title: string,
  description: string,
  type: 'info' | 'success' | 'warning' | 'error',
  dismissed: boolean,
  timestamp: number,
  href?: string,
  actionText?: string
}

export type NotificationAction = {
  type: 'add' | 'dismiss' | 'delete', 
  payload: Notification,
}

function notificationsReducer(notifications: Notification[], action: NotificationAction): Notification[] {
  // TODO: update backend
  switch (action.type) {
    case 'add':
      return [ ...notifications, action.payload ]
    case 'dismiss':
      return notifications
        .map(n => { 
          return { 
            ...n,
            dismissed: n === action.payload
          } 
        })
    case 'delete':
      return notifications.filter(n => n !== action.payload)
    default:
      return notifications
  }
}

const NotificationsContext = createContext<Notification[]>([])
const NotificationsDispatchContext = createContext<Dispatch<NotificationAction>>(() => [])

export default function NotificationsProvider({ children }: { children: React.ReactNode }) {
  // TODO: read initial notifications from backend
  const initialNotifications: Notification[] = [
    {
      title: 'Welcome to Application Collection extension!',
      description: 'Go to https://docs.apps.rancher.io/ to learn how to get started.',
      type: 'info',
      dismissed: true,
      timestamp: new Date().getTime() - 1000 * 60 * 60 * 24 * 40,
    },
    {
      title: 'Application successfully installed',
      description: 'The application xxxyyyZZZ-1234567 has been successfully deployed. Click here to view the release details.',
      type: 'success',
      dismissed: false,
      href: '/workloads',
      actionText: 'View details',
      timestamp: new Date().getTime() - 1000 * 60 * 60 * 24 * 2,
    },
    {
      title: 'Docker authentication failed',
      description: 'Couldn\'t authenticate with docker because of lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.',
      type: 'warning',
      dismissed: true,
      timestamp: new Date().getTime() - 1000 * 60 * 60 * 24 * 1,
    },
    {
      title: 'Deployment failed',
      description: 'The installation of xxxyyyZZZ-1234567 failed with: lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.',
      type: 'error',
      dismissed: false,
      href: '/workloads',
      actionText: 'View details',
      timestamp: new Date().getTime() - 1000 * 60 * 60 * 12,
    },
    {
      title: 'Welcome to Application Collection extension!',
      description: 'Go to https://docs.apps.rancher.io/ to learn how to get started.',
      type: 'info',
      dismissed: true,
      timestamp: new Date().getTime(),
    },
  ]
  const [ notifications, dispatch ] = useReducer(notificationsReducer, initialNotifications)

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
