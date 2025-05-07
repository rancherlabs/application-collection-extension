import { CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material'
import AuthenticationForm from './components/AuthenticationForm'
import { useEffect, useState } from 'react'
import { getContexts, useContext } from '../../clients/kubectl'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { useSnackbar } from 'notistack'

const ddClient = createDockerDesktopClient()

export default function SettingsPage() {
  return (
    <>
      <Typography variant='h3'>Authentication</Typography>
      <Typography variant='h5' sx={ { mb: 3 } }>Used to navigate and install the collection</Typography>
      <AuthenticationForm />
      <Typography variant='h3' sx={ { mt: 3 } }>Kubernetes</Typography>
      <Typography variant='h5' sx={ { mb: 3 } }>Configure the k8s clsuter where workloads will be installed</Typography>
      <K8sContextForm />
    </>
  )
}

function K8sContextForm() {
  const [ state, setState ] = useState<'loading' | 'ready'>()
  const [ contexts, setContexts ] = useState<{ name: string, selected?: boolean }[]>([])
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    setState('loading')
    getContexts(ddClient)
      .then(newContexts => setContexts(newContexts))
      .catch(error => enqueueSnackbar(error, { autoHideDuration: 5000, key: 'snackbar-k8s-get-contexts' }))
      .finally(() => setState('ready'))
  }, [])

  function switchContext(newContext: string) {
    setState('loading')
    useContext(ddClient, newContext)
      .then(() => setContexts(contexts.map(ctx => { return { name: ctx.name, selected: ctx.name === newContext } })))
      .catch(error => enqueueSnackbar(error, { autoHideDuration: 5000, key: 'snackbar-k8s-use-context' }))
      .finally(() => setState('ready'))
  }

  return (
    <Stack direction='row' alignItems='center' spacing={ 3 }>
      <FormControl 
        fullWidth 
        disabled={ state === 'loading' }
        size='small'
        sx={ { maxWidth: '50%' } } >
        <InputLabel id='k8s-context-label'>Context</InputLabel>
        <Select
          labelId='k8s-context-label'
          id='k8s-context'
          value={ contexts.find(ctx => ctx.selected)?.name || '' }
          label='Context'
          onChange={ e => switchContext(e.target.value) }>
          { contexts.map((ctx, i) => 
            <MenuItem 
              key={ `k8s-context-${i}` } 
              value={ ctx.name }>
              { ctx.name }
            </MenuItem>) }
        </Select>
      </FormControl>
      { state === 'loading' && <CircularProgress size={ 21 } /> }
    </Stack>
  )
}
