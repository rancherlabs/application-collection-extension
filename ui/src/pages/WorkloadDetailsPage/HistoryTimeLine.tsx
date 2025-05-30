import { ExpandMore } from '@mui/icons-material'
import { TimelineItem, TimelineOppositeContent, TimelineSeparator, TimelineConnector, TimelineContent, Timeline } from '@mui/lab'
import { Accordion, AccordionSummary, Stack, Typography, AccordionDetails } from '@mui/material'
import moment from 'moment'
import { HelmHistoryItem, mapStatus } from '../../clients/helm'
import StatusIcon from '../WorkloadsPage/components/StatusIcon'

export default function HistoryTimeLine({ history }: { history: HelmHistoryItem[] }) {
  function parseDescription(description: string): string {
    try {
      const json = JSON.parse(description)
      if (json.message) return json.message
    } catch (e) {
      // no-op
    }

    return description
  }

  return (
    <Accordion disableGutters elevation={ 0 } sx={ { mt: 2, '&::before': { display: 'none' } } }>
      <AccordionSummary expandIcon={ <ExpandMore /> }>
        <Stack>
          <Typography variant='h4'>History</Typography>
          { 
            history.find(h => h.status === 'failed') ? 
              <Typography color='error'>{ `${history.filter(h => h.status === 'failed').length} error${history.filter(h => h.status === 'failed').length > 1 ? 's' : ''}` }</Typography> :
              <Typography color='text.secondary'>{ history.length } revisions</Typography>
          }
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={ { borderTop: '1px solid lightgray', p: 0 , pt: 2 } }>
        <Timeline sx={ { p: 0, m: 0, mb: 1 } }>
          {
            history.map((entry, i) => <TimelineItem key={ `history-${i}` } sx={ { minHeight: i < history.length - 1 ? '40px' : 'auto' } }>
              <TimelineOppositeContent sx={ { width: '125px', maxWidth: '125px', p: 0, pr: 2 } }>{ moment(entry.updated).format('DD/MM/YY HH:mm:ss') }</TimelineOppositeContent>
              <TimelineSeparator>
                <StatusIcon status={ mapStatus(entry.status) } />
                { i < history.length - 1 && <TimelineConnector sx={ { my: 0.5 } } /> }
              </TimelineSeparator>
              <TimelineContent  sx={ { p: 0, pl: 2 } }>{ parseDescription(entry.description) }</TimelineContent>
            </TimelineItem>)
          }
        </Timeline>
      </AccordionDetails>
    </Accordion>
  )
}