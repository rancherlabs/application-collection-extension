import { Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { uninstallHelmChart } from '../../clients/helm'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { DeleteOutline } from '@mui/icons-material'
import Modal from '../Modal'

const ddClient = createDockerDesktopClient()

export default function UninstallDialog({ name, namespace, open, onSubmit = () => null, onDismiss = () => null }: 
{ name: string, namespace?: string, open: boolean, onSubmit?: () => any, onDismiss?: () => any }) {
  const [ submitDisabled, setSubmitDisabled ] = useState<boolean>(true)
  const [ error, setError ] = useState<string>()

  function uninstall() {
    uninstallHelmChart(ddClient, name, namespace)
      .then(() => {
        onSubmit()
      })
      .catch(e => setError(e))
  }

  return (
    <Modal
      title={ `Uninstall ${ name }?` }
      subtitle='This action CANNOT be undone, the workload will be deleted permanently'
      open={ open }
      onClose={ onDismiss }
      onSubmit={ uninstall }>
      <TextField 
        fullWidth 
        size='small'
        label={ `Type in '${ name }' to confirm` }
        onChange={ (e) => setSubmitDisabled(e.target.value !== name) }
        helperText={ error?.toString() }
        error={ error !== undefined }
        sx={ { mt: 1 } } />
      <Stack direction='row' justifyContent='space-between' sx={ { mt: 2 } }>
        <Button 
          color='inherit'
          onClick={ onDismiss }>Cancel</Button>
        <Button 
          type='submit'
          color='error'
          disabled={ submitDisabled } 
          variant='outlined'
          startIcon={ <DeleteOutline /> }>Uninstall</Button>
      </Stack>
    </Modal>
  )
}