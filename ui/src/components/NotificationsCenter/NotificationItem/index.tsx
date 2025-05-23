import { Badge, Button, Card, CardActionArea, CardActions, CardContent, Stack, Typography } from '@mui/material'
import { Notification, useNotificationsDispatch } from '../NotificationsContext'
import StatusIcon from './StatusIcon'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

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
      <CardActionArea 
        sx={ { cursor: 'default' } }>
        <CardContent 
          sx={ { 
            p: 2,
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
              alignItems='center'
              justifyContent='space-between'
              spacing={ 2 }>
              <Typography 
                variant='h5' 
                color='text.primary'>
                { notification.title }
              </Typography>
              <Badge 
                color='primary' 
                variant='dot' 
                sx={ { 
                  display: notification.dismissed ? 'none' : 'inline-block',
                  position: 'relative',
                  transform: 'none'
                } } />
            </Stack>
            <Typography 
              variant='caption' 
              color='text.secondary'
              gutterBottom>
              { moment(notification.timestamp).calendar() }
            </Typography>
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
              variant='contained'>
              { notification.actionText }
            </Button>
          </CardActions>
        }
      </CardActionArea>
    </Card>
  )
}