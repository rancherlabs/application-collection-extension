import { Typography } from '@mui/material'
import AuthenticationForm from './components/AuthenticationForm'

export default function SettingsPage() {
  return (
    <>
      <Typography variant='h3'>Authentication</Typography>
      <Typography variant='h5' sx={ { mb: 3 } }>Used to navigate and install the collection</Typography>
      <AuthenticationForm />
    </>
  )
}
