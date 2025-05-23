import { Badge, Button, Card, CardActionArea, CardActions, CardContent, Stack, Typography } from '@mui/material'
import { Notification, useNotificationsDispatch } from '../NotificationsContext'
import StatusIcon from './StatusIcon'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { NotificationsOffOutlined, NotificationsOutlined } from '@mui/icons-material'

export default function NotificationItem({ notification, onClose }: { notification: Notification, onClose?: () => void }) {
  const navigate = useNavigate()
  const dispatch = useNotificationsDispatch()

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
          direction='column' >
          <Stack
            direction='row'
            alignItems='start'
            justifyContent='space-between'
            spacing={ 2 }>
            <Stack>
              <Typography 
                variant='h5' 
                color='text.primary'>
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
          <Typography
            variant='body2'>{ notification.description }</Typography>
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
                navigate(notification.href as string)
                if (onClose) onClose()
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