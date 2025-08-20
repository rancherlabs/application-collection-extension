import Button from '@mui/material/Button'
import { Badge, Box, Container, Stack, Theme, useMediaQuery } from '@mui/material'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppsOutlined, EditOutlined, KeyboardArrowLeft, NotificationsNone, SettingsOutlined } from '@mui/icons-material'
import { useNotificationsCenterOpenContext, useNotificationsCenterOpenDispatch, useNotificationsContext } from './components/NotificationsCenter/NotificationsContext'
import NotificationsCenter from './components/NotificationsCenter'

export function Layout() {
  const notifications = useNotificationsContext()
  const notificationsCenterOpen = useNotificationsCenterOpenContext()
  const dispatchNotificationsCenterOpen = useNotificationsCenterOpenDispatch()

  const navigate = useNavigate()
  const location = useLocation()

  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  return (
    <>
      <Box component='main' sx={ { display: 'flex', alignItems: 'start', width: '100%', flexGrow: 1, py: 3 } }>
        <Container maxWidth={ isSmallScreen ? 'md' : 'lg' } sx={ { overflow: 'hidden' } }>
          <Outlet />
        </Container>
        <Stack direction='column' alignItems='start' width='fit-content' sx={ { mr: 2 } }>
          <Button onClick={ () => dispatchNotificationsCenterOpen(true) }>
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
        onClose={ () => dispatchNotificationsCenterOpen(false) } />
    </>
  )
}
