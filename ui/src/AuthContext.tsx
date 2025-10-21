import { createDockerDesktopClient } from '@docker/extension-api-client'
import { createContext, useContext, useEffect, useReducer } from 'react'
import { ServiceError } from '@docker/extension-api-client-types/dist/v1'

type Auth = string | null | undefined

type ReducerAction = {
  type: 'set' | 'update' | 'delete',
  payload?: Auth
}

const TOKEN_KEY: string = 'token'

function authReducer(auth: Auth, action: ReducerAction): Auth | undefined {
  switch (action.type) {
    case 'set':
    case 'update':
      if (action.payload) {
        localStorage.setItem(TOKEN_KEY, action.payload)
      }

      return action.payload
    case 'delete':
      localStorage.removeItem(TOKEN_KEY)
      return null
    default:
      return undefined
  }
}

const AuthContext = createContext<Auth | undefined>(undefined)
const AuthDispatchContext = createContext<(action: ReducerAction) => any>(() => undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const ddClient = createDockerDesktopClient()
  const [ auth, dispatch ] = useReducer(authReducer, localStorage.getItem(TOKEN_KEY) || undefined)

  useEffect(() => {
    async function getCredentialsFromBackend(currentAttempt: number, maxAttempts: number, intervalWaitMillis: number) {
      try {
        const response = await ddClient.extension.vm?.service?.get('/user/auth') as any
        const auth = response.data ? atob(response.data) : atob(response)

        dispatch({ type: 'set', payload: auth })
      } catch (e) {
        console.error('Unexpected error fetching authentication from backend', e)
        if (currentAttempt < maxAttempts && (!(e as ServiceError).statusCode || (e as ServiceError).statusCode >= 500)) {
          setTimeout(() => getCredentialsFromBackend(currentAttempt + 1, maxAttempts, intervalWaitMillis), intervalWaitMillis)
        } else {
          dispatch({ type: 'set', payload: null })
        }
      }
    }

    getCredentialsFromBackend(0, 3, 500)
  }, [])

  return (
    <AuthContext.Provider value={ auth }>
      <AuthDispatchContext.Provider value={ dispatch }>
        { children }
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useAuthDispatch() {
  return useContext(AuthDispatchContext)
}
