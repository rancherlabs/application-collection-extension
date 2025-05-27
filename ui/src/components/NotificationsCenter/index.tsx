import { useNotificationsContext, useNotificationsDispatch } from './NotificationsContext'
import NotificationItem from './NotificationItem'
import { Button, Drawer, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useState } from 'react'


export default function NotificationsCenter({ id, open, onClose }: { id?: string, open: boolean, onClose: () => any }) {
  const notifications = useNotificationsContext()
  const dispatch = useNotificationsDispatch()

  const [ filter, setFilter ] = useState<'all' | 'unread'>('all')

  function handleFilterToggle(newFilter: any) {
    if (newFilter != null) {
      setFilter(newFilter)
    }
  }

  function markAllRead() {
    notifications.filter(n => !n.dismissed)
      .forEach(n => dispatch({ type: 'dismiss', payload: n }))
  }

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
        spacing={ 2 }
        sx={ { p: 2, pt: 1 } }>
        <Typography 
          variant='h4'>
          Notifications
        </Typography>
        <ToggleButtonGroup
          color='primary'
          value={ filter }
          exclusive
          onChange={ (e, newFilter) => handleFilterToggle(newFilter) }
          aria-label='Platform'
          size='small'>
          <ToggleButton value='all' sx={ { py: 0 } }>
            All
          </ToggleButton>
          <ToggleButton value='unread' sx={ { py: 0 } }>
            Unread
          </ToggleButton>
        </ToggleButtonGroup>
        <Button 
          size='small'
          onClick={ () => markAllRead() }>Mark all as read</Button>
      </Stack>
      <Stack 
        spacing={ 1 }>
        {
          notifications.length === 0 &&
          <Typography color='text.secondary' sx={ { p: 2 } }>You don't have notifications yet.</Typography>
        }
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