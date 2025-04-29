import { Card, Modal as MuiModal, Typography } from '@mui/material'

type ModalProps = { 
  title: string, 
  subtitle: string, 
  children: React.ReactNode, 
  open: boolean, 
  onClose: () => any, 
  onSubmit?: () => any 
}

export default function Modal(props: ModalProps) {
  return <MuiModal
    open={ props.open }
    onClose={ props.onClose }
    sx={ { '& .MuiBackdrop-root': { background: 'radial-gradient(ellipse, rgba(0,0,0,0.2) 25%, rgba(0,0,0,0) 75%)' } } }>
    <Card
      component='form'
      sx={
        {
          position: 'absolute',
          top: '50%',
          left: '49%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxHeight: '80%',
          overflowY: 'auto',
          p: 3,
        }
      }
      onSubmit={ (e) => {
        e.preventDefault()
        if (props.onSubmit) props.onSubmit()
      } }>
      <Typography variant='h3' gutterBottom>{ props.title }</Typography>
      <Typography variant='h5' sx={ { mb: 2 } }>{ props.subtitle }</Typography>
      { props.children }
    </Card>
  </MuiModal>
}