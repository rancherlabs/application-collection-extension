import { Button, Stack, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { uninstallHelmChart } from '../../../clients/helm'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { DeleteOutline } from '@mui/icons-material'
import Modal from '../../../components/Modal'

const ddClient = createDockerDesktopClient()

export default function UninstallDialog({ name, namespace, isOpen, onSubmit = () => null, onDismiss = () => null }: 
{ name: string, namespace?: string, isOpen: boolean, onSubmit?: () => any, onDismiss?: () => any }) {
  const [ open, setOpen ] = useState<boolean>(isOpen)
  const [ submitDisabled, setSubmitDisabled ] = useState<boolean>(true)
  const [ error, setError ] = useState<string>()

  useEffect(() => {
    if (isOpen) setOpen(isOpen)
  }, [isOpen])

  function close() {
    setOpen(false) 
    onDismiss()
  }

  function uninstall() {
    uninstallHelmChart(ddClient, name, namespace)
      .then(() => {
        setOpen(false)
        onSubmit()
      })
      .catch(e => setError(e))
  }

  return (
    <Modal
      title={ `Uninstall ${ name }?` }
      subtitle='This action CANNOT be undone, the workload will be deleted permanently'
      open={ open }
      onClose={ close }
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
          onClick={ close }>Cancel</Button>
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