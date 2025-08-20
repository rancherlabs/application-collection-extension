import { useState } from 'react'
import { useAuth, useAuthDispatch } from '../../../AuthContext'
import { dockerLogin, dockerLogout } from '../../../clients/docker'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { kubernetesLogin, kubernetesLogout } from '../../../clients/kubectl'
import { helmLogin, helmLogout } from '../../../clients/helm'
import { Alert, Box, Button, Card, CardContent, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemText, OutlinedInput, Stack, TextField, Typography } from '@mui/material'
import { Check, Visibility, VisibilityOff } from '@mui/icons-material'

const ddClient = createDockerDesktopClient()

export default function AuthenticationForm() {
  const auth = useAuth()
  const dispatch = useAuthDispatch()
  const [ username, setUsername ] = useState<string | undefined>(auth?.split(':')[0])
  const [ token, setToken ] = useState<string | undefined>(auth?.split(':')[1])
  const [ state, setState ] = useState<'loading' | 'saved' | 'error'>()
  const [ error, setError ] = useState<string>()
  const [ showPassword, setShowPassword ] = useState<boolean>(false)

  async function saveAuth() {
    if (username && token) {
      const newAuth = `${username}:${token}`
      setState('loading')

      dockerLogout(ddClient)
        .catch(e => console.error('Unexpected error running docker logout', e))
        .finally(() => 
          dockerLogin(ddClient, username, token)
            .then(() => {
              kubernetesLogout(ddClient)
                .catch(e => console.error('Unexpected error deleting kubernetes secret', e))
                .finally(() => {
                  kubernetesLogin(ddClient, username, token)
                    .then(() => {
                      helmLogout(ddClient)
                        .catch(e => console.error('Unexpected error running helm logout', e))
                        .finally(() => {
                          helmLogin(ddClient, username, token)
                            .then(() => {
                              new Promise<void>((resolve, reject) => {
                                const timeout = setTimeout(() => reject(), 10000)
                                ddClient.extension.vm?.service?.post('/user/logout', {})
                                  .catch(() => console.error('Unexpected error commanding helm logout in backend'))
                                  .finally(() => {
                                    ddClient.extension.vm?.service?.post('/user/login', { username, password: token })
                                      .then(() => {
                                        dispatch({ 
                                          type: 'set', 
                                          payload: newAuth 
                                        })
                                        setState('saved')
                                        setError(undefined)
                                        clearTimeout(timeout)
                                        resolve()
                                      })
                                      .catch((e) => {
                                        console.error('Unexpected error persisting authentication in extension backend', e)
                                        setState('error')
                                        setError('Cannot persist the authentication in the extension backend. Make sure it is up and running')
                                      })
                                  })
                              }).catch(() => {
                                setError('Timeout connecting to extension backend. Make sure it is up and running.')
                                setState('error')
                              })
                            })
                            .catch(e => {
                              console.error('Unexpected error running helm registry login', e)
                              setState('error')
                              setError('Error running helm registry login, make sure you can reach dp.apps.rancher.io')
                            })
                        })
                    })
                    .catch(e => {
                      console.error('Unexpected error creating kubernetes secret', e)
                      setState('error')
                      setError('Error creating kubernetes secret, make sure the cluster is up and reachable')
                    })
                })
            })
            .catch(e => {
              console.error('Unexpected error running docker login', e)
              if (e.stderr.includes('401 Unauthorized')) {
                setError('Invalid authentication pair')
              } else {
                setError('Error running docker login, make sure the daemon is started')
              }
              setState('error')
            })
        )
    }
  }

  return (
    <>
      <Stack direction='row' alignItems='top'>
        <TextField 
          label='Username'
          helperText='Example: foo@bar.com'
          value={ username?.toString() || '' }
          variant='outlined'
          size='small'
          error={ state === 'error' }
          onChange={ evt => setUsername(evt.target.value as string) }
          sx={ { mr: 2 } } />
        <FormControl 
          variant='outlined' 
          size='small'
          sx={ { mr: 2 } } >
          <InputLabel htmlFor='access-token'>Access Token</InputLabel>
          <OutlinedInput
            id='access-token'
            type={ showPassword ? 'text' : 'password' }
            label='Access Token'
            value={ token?.toString() || '' }
            error={ state === 'error' }
            onChange={ evt => setToken(evt.target.value as string) }
            endAdornment={
              <InputAdornment position='end'>
                <IconButton
                  aria-label='toggle password visibility'
                  onClick={ () => setShowPassword((show) => !show) }
                  onMouseDown={ e => e.preventDefault() }
                  edge='end'>
                  { showPassword ? <VisibilityOff /> : <Visibility /> }
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <Button 
          startIcon={ state === 'loading' && <CircularProgress size={ 16 } color='inherit' /> }
          disabled={ state === 'loading' }
          variant='contained'
          onClick={ saveAuth }
          sx={ { mr: 2, height: 'fit-content' } }>
          { state === 'loading' ? 'Saving' : 'Save credentials' }
        </Button>
        {
          state === 'saved' && 
          <Box display='flex' alignItems='start' sx={ { pt: 0.6 } }>
            <Check color='success' /> 
          </Box> 
        }
      </Stack>
      {
        state === 'error' &&
        <Alert severity='error' icon={ false } sx={ { mt: 3 } }>
          <Typography>{ error }</Typography>
        </Alert>
      }
      <Card sx={ { mt: 3 } } variant='outlined'>
        <CardContent sx={ { p: 3 } }>
          <Typography>The following will be configured automatically:</Typography>
          <List sx={ { width: '100%', pb: 0 } }>
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
            <ListItem sx={ { alignItems: 'end', pb: 0 } }>
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