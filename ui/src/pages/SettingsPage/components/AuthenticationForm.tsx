import { useState } from 'react'
import { useAuth, useAuthDispatch } from '../../../AuthContext'
import { dockerLogin, dockerLogout } from '../../../clients/docker'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { kubernetesLogin, kubernetesLogout } from '../../../clients/kubectl'
import { helmLogin, helmLogout } from '../../../clients/helm'
import { Box, Button, Card, CardContent, CircularProgress, List, ListItem, ListItemText, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { Check, WarningAmberOutlined } from '@mui/icons-material'

const ddClient = createDockerDesktopClient()

export default function AuthenticationForm() {
  const auth = useAuth()
  const dispatch = useAuthDispatch()
  const [ username, setUsername ] = useState<string | undefined>(auth?.auth?.split(':')[0])
  const [ token, setToken ] = useState<string | undefined>(auth?.auth?.split(':')[1])
  const [ state, setState ] = useState<'loading' | 'saved' | 'error'>()
  const [ error, setError ] = useState<string>()

  async function saveAuth() {
    if (username && token) {
      const newAuth = `${username}:${token}`
      setState('loading')
      const errors: string[] = []
      dockerLogout(ddClient)
        .catch(e => console.error('Unexpected error running docker logout', e))
        .finally(() => dockerLogin(ddClient, username, token)
          .then(() => {
            kubernetesLogout(ddClient)
              .catch(e => console.error('Unexpected error deleting kubernetes secret', e))
              .finally(() => kubernetesLogin(ddClient, username, token)
                .catch(e => {
                  console.error('Unexpected error creating kubernetes secret', e)
                  errors.push('Error creating kubernetes secret, make sure the cluster is up and reachable')
                })
                .finally(() => {
                  helmLogout(ddClient)
                    .catch(e => console.error('Unexpected error running helm logout', e))
                    .finally(() => {
                      helmLogin(ddClient, username, token)
                        .catch(e => {
                          console.error('Unexpected error running helm registry login', e)
                          errors.push('Error running helm registry login, make sure you can reach dp.apps.rancher.io')
                        })
                        .finally(() => {
                          new Promise<void>((resolve, reject) => {
                            const timeout = setTimeout(() => reject(), 10000)
                            ddClient.extension.vm?.service?.post('/user/logout', {})
                              .catch(() => console.error('Unexpected error commanding helm logout in backend'))
                              .finally(() => {
                                ddClient.extension.vm?.service?.post('/user/login', { username, password: token })
                                  .catch((e) => {
                                    console.error('Unexpected error commanding helm login in backend', e)
                                    errors.push('Internal backend error persisting authentication, make sure the extension backend is running')
                                  })
                                  .finally(() => {
                                    if (errors.length == 0) {
                                      dispatch({ 
                                        type: 'set', 
                                        payload: {
                                          auth: newAuth,
                                          errors: errors.map(e => { return { message: e, dismissed: false } })
                                        } })
                                      setState('saved')
                                    } else {
                                      dispatch({ 
                                        type: 'set', 
                                        payload: {
                                          errors: errors.map(e => { return { message: e, dismissed: false } })
                                        } })
                                      setState('error')
                                    }
                                    clearTimeout(timeout)
                                    resolve()
                                  })
                              })
                          }).catch(() => {
                            errors.push('Cannot connect to extension backend. Make sure the backend container is running.')
                            dispatch({ 
                              type: 'set', 
                              payload: {
                                errors: errors.map(e => { return { message: e, dismissed: false } })
                              } })
                            setState('error')
                          })
                        })
                    })
                }))
          })
          .catch(e => {
            console.error('Unexpected error running docker login', e)
            if (e.stderr.includes('401 Unauthorized')) {
              setError('Invalid authentication pair')
              setState('error')
            } else {
              errors.push('Error running docker login, make sure the daemon is started')
            }
          })
        )
        
    }
  }

  return (
    <>
      <Stack direction='row' alignItems='top'>
        <TextField 
          label='Username'
          helperText={ error ? error : 'Example: foo@bar.com' }
          value={ username?.toString() || '' }
          variant='outlined'
          size='small'
          error={ error !== undefined && error !== '' }
          onChange={ evt => setUsername(evt.target.value as string) }
          sx={ { mr: 2 } } />
        <TextField 
          label='Access Token'
          value={ token?.toString() || '' }
          variant='outlined'
          size='small'
          error={ error !== undefined && error !== '' }
          onChange={ evt => setToken(evt.target.value as string) }
          sx={ { mr: 2 } } />
        <Button 
          startIcon={ state === 'loading' && <CircularProgress size={ 16 } color='inherit' /> }
          disabled={ state === 'loading' }
          variant='contained'
          onClick={ saveAuth }
          sx={ { mr: 2, height: 'fit-content' } }>
          { state === 'loading' ? 'Saving' : 'Save credentials' }
        </Button>
        {
          <Box display='flex' alignItems='start' sx={ { pt: 0.6 } }>
            { auth?.errors && auth?.errors?.length > 0 ? 
              <Tooltip title='Current auth may not work as expected'><WarningAmberOutlined color='warning' /></Tooltip> : 
              state === 'saved' && <Check color='success' /> } 
          </Box> 
        }
      </Stack>
      <Card sx={ { mt: 3 } } variant='outlined'>
        <CardContent>
          <Typography>The following will be configured automatically:</Typography>
          <List sx={ { width: '100%' } }>
            <ListItem sx={ { alignItems: 'end' } }>
              <ListItemText 
                primary='Docker'
                secondary='For pulling and installing container images' />
              <Typography variant='code' color='text.secondary' sx={ { mb: 0.75 } }>docker login</Typography>
            </ListItem>
            <ListItem sx={ { alignItems: 'end' } }>
              <ListItemText
                primary='Helm'
                secondary='For pulling and installing Helm Charts' />
              <Typography variant='code' color='text.secondary' sx={ { mb: 0.75 } }>helm registry login</Typography>
            </ListItem>
            <ListItem sx={ { alignItems: 'end' } }>
              <ListItemText
                primary='kubectl'
                secondary='For running kubernetes workloads' />
              <Typography variant='code' color='text.secondary' sx={ { mb: 0.75 } }>kubectl create secret</Typography>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </>
  )
}