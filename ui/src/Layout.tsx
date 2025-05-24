import Button from '@mui/material/Button'
import { Badge, Box, Container, Stack, Theme, Typography, useMediaQuery } from '@mui/material'
import { useAuth, useAuthDispatch } from './AuthContext'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppsOutlined, EditOutlined, KeyboardArrowLeft, NotificationsNone, SettingsOutlined } from '@mui/icons-material'
import AuthenticationForm from './pages/SettingsPage/components/AuthenticationForm'
import { useEffect, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { ServiceError } from '@docker/extension-api-client-types/dist/v1'
import { usersClient } from './clients/backend'
import { useSnackbar } from 'notistack'
import { useNotificationsContext } from './components/NotificationsCenter/NotificationsContext'
import NotificationsCenter from './components/NotificationsCenter'

const ddClient = createDockerDesktopClient()

async function clearAuthenticationData(dispatch: (action: any) => any) {
  dispatch({ type: 'delete' })
  await ddClient.extension.vm?.service?.post('/user/logout', {})
}

async function askForCredentials(dispatch: (action: any) => any, currentAttempt: number, maxAttempts: number, intervalWaitMillis: number) {
  try {
    const base64Auth = await ddClient.extension.vm?.service?.get('/user/auth') as string
    const auth = atob(base64Auth)
    try {
      const login = await usersClient(auth).loginUser()
      if (login.status == 200) {
        dispatch({ type: 'set', payload: { auth } })
      }
    } catch (e) {
      console.error(`Unexpected error recovering authentication [error=${e}]`)
      clearAuthenticationData(dispatch)
    }
  } catch (e) {
    console.error(e)
    if (currentAttempt < maxAttempts && (!(e as ServiceError).statusCode || (e as ServiceError).statusCode >= 500)) {
      setTimeout(() => askForCredentials(dispatch, currentAttempt + 1, maxAttempts, intervalWaitMillis), intervalWaitMillis)
    } else {
      clearAuthenticationData(dispatch)
    }
  }
}

export function Layout() {
  const notifications = useNotificationsContext()
  const [ notificationsCenterOpen, setNotificationsCenterOpen ] = useState<boolean>(false)

  const auth = useAuth()
  const dispatch = useAuthDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { enqueueSnackbar } = useSnackbar()

  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  useEffect(() => {
    if (auth?.auth === undefined) askForCredentials(dispatch, 0, 3, 500)
    if (auth) {
      auth.errors?.map((e, i) => enqueueSnackbar(e.message, { autoHideDuration: 5000, key: `snackbar-${i}` })) 
    }
  }, [auth])

  if (auth?.auth === null) {
    return (
      <Box component='main' sx={ { width: '100%', flexGrow: 1, py: 3 } }>
        <Container maxWidth={ isSmallScreen ? 'md' : 'lg' }>
          <Typography variant='h2'>Authorization required</Typography>
          <Typography variant='h5' gutterBottom>This extension requires login.</Typography>
          <Typography variant='body1' sx={ { my: 3 } }>Learn more about authentication methods in the Authentication section of our documentation site.</Typography>
          <AuthenticationForm />
        </Container>
      </Box>
    )
  }

  return (
    <>
      <Box component='main' sx={ { display: 'flex', alignItems: 'start', width: '100%', flexGrow: 1, py: 3 } }>
        <Container maxWidth={ isSmallScreen ? 'md' : 'lg' }>
          <Outlet />
        </Container>
        <Stack direction='column' alignItems='start' width='fit-content' sx={ { mr: 2 } }>
          <Button onClick={ () => setNotificationsCenterOpen(true) }>
            {
              notifications.find(n => !n.dismissed) ?
                <Badge 
                  color='secondary'
                  variant='dot'
                  sx={ { mr: 2 } } >
                  <NotificationsNone />
                </Badge> :
                <NotificationsNone sx={ { mr: 2 } } />
            }
            Notifications
          </Button>
          <Button onClick={ () => navigate('/') }><AppsOutlined sx={ { mr: 2 } } />Applications</Button>
          <Button onClick={ () => navigate('/workloads') }><SettingsOutlined sx={ { mr: 2 } } />Workloads</Button>
          <Button onClick={ () => navigate('/settings') }><EditOutlined sx={ { mr: 2 } } />Settings</Button>
          { 
            location?.pathname !== '/' && 
          location?.pathname !== '/applications' && 
          location?.pathname !== '/workloads' &&
          location?.pathname !== '/settings' &&
          <Button onClick={ () => navigate(-1) }><KeyboardArrowLeft sx={ { mr: 2 } } /> Back</Button> 
          }
        </Stack>
      </Box>
      <NotificationsCenter
        open={ notificationsCenterOpen }
        onClose={ () => setNotificationsCenterOpen(false) } />
    </>
  )
}
