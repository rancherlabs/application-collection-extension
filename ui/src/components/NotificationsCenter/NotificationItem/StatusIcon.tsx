import { CancelOutlined, CheckCircleOutline, ErrorOutline, InfoOutlined } from '@mui/icons-material'
import { SvgIconProps } from '@mui/material'

export default function StatusIcon({ status }: { status: 'info' | 'success' | 'warning' | 'error' }) {
  const props: SvgIconProps = { sx: { fontSize: '20px', mr: 2 } }

  switch (status) {
    case 'success':
      return <CheckCircleOutline { ...props } color='secondary' />
    case 'warning':
      return <ErrorOutline { ...props } color='warning' />
    case 'error':
      return <CancelOutlined { ...props } color='error' />
    case 'info':
    default:
      return <InfoOutlined { ...props } color='primary' />
  }
}