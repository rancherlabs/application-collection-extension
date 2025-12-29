import { Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import { Notification, useNotificationsDispatch } from '../NotificationsContext'
import StatusIcon from './StatusIcon'
import moment from 'moment'
import { Link, useNavigate } from 'react-router-dom'
import { NotificationsOffOutlined, NotificationsOutlined } from '@mui/icons-material'

export default function NotificationItem({ notification, onClose, location }: { notification: Notification, onClose: () => void, location?: string }) {
  const navigate = useNavigate()
  const dispatch = useNotificationsDispatch()

  function toggleNotificationState() {
    if (notification.dismissed) {
      dispatch({ type: 'undismiss', payload: notification })
    } else {
      dispatch({ type: 'dismiss', payload: notification })
    }
  }

  return (
    <Card
      variant='outlined' 
      sx={ { 
        maxWidth: '400px', 
        '&:hover': { borderColor: 'primary.main', boxShadow: 2 } } 
      }>
      <CardContent 
        sx={ { 
          px: 2,
          pb: notification.href ? 0 : 2,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        } }>
        <StatusIcon status={ notification.type } />
        <Stack
          flexGrow={ 1 }
          direction='column'
          overflow='hidden' >
          <Stack
            direction='row'
            alignItems='start'
            justifyContent='space-between'
            spacing={ 2 }>
            <Stack>
              <Typography 
                variant='h5' 
                color='text.primary'
                sx={ { my: 0 } }>
                { notification.title }
              </Typography>
              <Typography 
                variant='caption' 
                color='text.secondary'
                gutterBottom>
                { moment(notification.timestamp).calendar() }
              </Typography>
            </Stack>
            <Button 
              disableRipple
              value='dismiss'
              size='small'
              color={ notification.dismissed ? 'inherit' : 'primary' }
              onClick={ () => toggleNotificationState() }
              sx={ { 
                opacity: notification.dismissed ? 0.5 : 1, 
                minWidth: 0,
                '&:hover': { backgroundColor: 'initial' } } }>
              { notification.dismissed ?
                <NotificationsOffOutlined fontSize='small' /> :
                <NotificationsOutlined fontSize='small' /> 
              }
            </Button>
          </Stack>
          {
            notification.id === '-1' ? 
              <div>
                <Typography variant='body2'>Log in through the <Link to='/settings'>Settings</Link> section to start installing and upgrading applications from the collection.</Typography>
                <Typography variant='body2' sx={ { mt: 1 } }>Find more at https://docs.apps.rancher.io/</Typography>
              </div> :
              notification.description.split('\n')
                .filter(line => line)
                .map((line, i) => <Typography
                  key={ `desc-line-${i}` }
                  variant='body2'>{ line }</Typography>)
          }
        </Stack>
      </CardContent>
      {
        notification.href && 
          <CardActions
            sx={ {
              flexDirection: 'row-reverse',
              p: 2
            } }>
            <Button
              onClick={ () => {
                if (location === notification.href) {
                  navigate(0)
                } else {
                  navigate(notification.href as string)
                }
                dispatch({ type: 'dismiss', payload: notification })
                onClose()
              } }
              variant='contained'
              size='small'>
              { notification.actionText }
            </Button>
          </CardActions>
      }
    </Card>
  )
}