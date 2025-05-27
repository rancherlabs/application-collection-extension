import { CancelOutlined, CheckCircleOutline, ErrorOutline, InfoOutlined } from '@mui/icons-material'
import { Box, CircularProgress, SvgIconProps } from '@mui/material'

export default function StatusIcon({ status }: { status: 'info' | 'progress' | 'success' | 'warning' | 'error' }) {
  const props: SvgIconProps = { sx: { fontSize: '20px', mr: 2 } }

  switch (status) {
    case 'success':
      return <CheckCircleOutline { ...props } color='secondary' />
    case 'warning':
      return <ErrorOutline { ...props } color='warning' />
    case 'error':
      return <CancelOutlined { ...props } color='error' />
    case 'progress':
      return <Box sx={ { mr: 2 } }><CircularProgress size={ 20 } color='primary' /></Box>
    case 'info':
    default:
      return <InfoOutlined { ...props } color='primary' />
  }
}