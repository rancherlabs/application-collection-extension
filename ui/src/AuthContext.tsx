import { createContext, useContext, useReducer } from 'react'

type AuthContextPayload = {
  auth?: string | null,
  errors?: {
    dismissed: boolean,
    message: string
  }[]
}

const AuthContext = createContext<AuthContextPayload | undefined>(undefined)
const AuthDispatchContext = createContext<(action: ReducerAction) => any>(() => undefined)

type ReducerAction = {
  type: 'set' | 'update' | 'delete' | 'dismiss_errors',
  payload?: AuthContextPayload
}

const TOKEN_KEY: string = 'token'

function authReducer(state: AuthContextPayload | undefined, action: ReducerAction): AuthContextPayload | undefined {
  switch (action.type) {
    case 'set':
    case 'update':
      if (action.payload?.auth) {
        localStorage.setItem(TOKEN_KEY, action.payload.auth)
      }

      return {
        auth: action.payload?.auth ? action.payload.auth : state?.auth,
        errors: action.payload?.errors ? action.payload.errors : state?.errors
      }
    case 'dismiss_errors':
      return {
        auth: state?.auth,
        errors: state?.errors?.map(e => {
          if (action.payload?.errors?.find(dismissed => dismissed.message === e.message)) {
            return {
              dismissed: true,
              message: e.message
            }
          }

          return e
        } )
      }
    case 'delete':
      localStorage.removeItem(TOKEN_KEY)
      return {
        auth: null
      }
    default:
      return undefined
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ auth, dispatch ] = useReducer(authReducer, { auth: localStorage.getItem(TOKEN_KEY) || undefined })

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
