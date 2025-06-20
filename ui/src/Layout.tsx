import Button from '@mui/material/Button'
import { Badge, Box, Container, Stack, Theme, Typography, useMediaQuery } from '@mui/material'
import { useAuth } from './AuthContext'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppsOutlined, EditOutlined, KeyboardArrowLeft, NotificationsNone, SettingsOutlined } from '@mui/icons-material'
import AuthenticationForm from './pages/SettingsPage/components/AuthenticationForm'
import { useState } from 'react'
import { useNotificationsContext } from './components/NotificationsCenter/NotificationsContext'
import NotificationsCenter from './components/NotificationsCenter'

export function Layout() {
  const notifications = useNotificationsContext()
  const [ notificationsCenterOpen, setNotificationsCenterOpen ] = useState<boolean>(false)

  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  if (auth === null) {
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
        <Container maxWidth={ isSmallScreen ? 'md' : 'lg' } sx={ { overflow: 'hidden' } }>
          <Outlet />
        </Container>
        <Stack direction='column' alignItems='start' width='fit-content' sx={ { mr: 2 } }>
          <Button onClick={ () => setNotificationsCenterOpen(true) }>
            {
              notifications.find(n => !n.dismissed) ?
                <Badge 
                  color={ notifications.filter(n => !n.dismissed).find(n => n.type === 'error') ? 'error' : 'primary' }
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
