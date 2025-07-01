import { SvgIconComponent } from '@mui/icons-material'
import { PopperProps, Tooltip, Stack, SvgIcon, Typography, Skeleton } from '@mui/material'

export default function HintIcon({ tooltip, icon, text }: { tooltip: string, icon: SvgIconComponent, text: string }) {
  const popperProps: Partial<PopperProps> = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, -4]
        }
      }
    ]
  }

  return (
    <Tooltip title={ tooltip } slotProps={ { popper: popperProps } }>
      <Stack direction='row' justifyContent='start' alignItems='center' spacing={ 0.5 }>
        <SvgIcon component={ icon } fontSize='small' sx={ { color: 'text.secondary' } } />
        <Typography color='text.secondary'>{ text }</Typography>
      </Stack>
    </Tooltip>
  )
}

export function LoadingHintIcon({ width = 70 }: { width?: number }) {
  return <Skeleton variant='text' height={ 20 } width={ width }/>
}
