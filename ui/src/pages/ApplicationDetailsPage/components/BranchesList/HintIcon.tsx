import { SvgIconComponent } from '@mui/icons-material'
import { PopperProps, Tooltip, Stack, SvgIcon, Typography } from '@mui/material'

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
    <Tooltip title={ tooltip } PopperProps={ popperProps }>
      <Stack direction='row' justifyContent='start' alignItems='center' spacing={ 0.5 }>
        <SvgIcon component={ icon } fontSize='small' sx={ { color: 'text.secondary' } } />
        <Typography color='text.secondary'>{ text }</Typography>
      </Stack>
    </Tooltip>
  )
}