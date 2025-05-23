import { useNotificationsContext } from './NotificationsContext'
import NotificationItem from './NotificationItem'
import { Button, Drawer, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useState } from 'react'


export default function NotificationsCenter({ id, open, onClose }: { id?: string, open: boolean, onClose: () => any }) {
  const notifications = useNotificationsContext()

  const [ filter, setFilter ] = useState<'all' | 'unread'>('all')

  return (
    <Drawer
      id={ id }
      anchor='right'
      open={ open }
      onClose={ onClose }
      PaperProps={ {
        sx: {
          p: 1,
          overflow: 'scroll'
        }
      } }>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={ { p: 2, pt: 1 } }>
        <Typography 
          variant='h4'>
          Notifications
        </Typography>
        <ToggleButtonGroup
          color='primary'
          value={ filter }
          exclusive
          onChange={ (e, newFilter) => setFilter(newFilter) }
          aria-label='Platform'
          size='small'>
          <ToggleButton value='all' sx={ { py: 0 } }>
            All
          </ToggleButton>
          <ToggleButton value='unread' sx={ { py: 0 } }>
            Unread
          </ToggleButton>
        </ToggleButtonGroup>
        <Button size='small'>Mark all as read</Button>
      </Stack>
      <Stack 
        spacing={ 1 }>
        {
          notifications
            .filter(n => filter === 'unread' ? !n.dismissed : n )
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((n, i) => <NotificationItem 
              key={ `notification-${i}` }
              notification={ n }
              onClose={ onClose } />
            )
        }
      </Stack>
    </Drawer>
  )
}