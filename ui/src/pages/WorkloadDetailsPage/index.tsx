import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Box, Button, Card, CardContent, Stack, Tooltip, Typography } from '@mui/material'
import { useLoaderData } from 'react-router-dom'
import { findRelease, HelmReleaseDetails } from '../../clients/helm'
import { ChangeCircleOutlined, Delete, EditOutlined, Grid3x3, HomeOutlined, SyncOutlined, Upgrade } from '@mui/icons-material'
import moment from 'moment'
import StatusIcon from '../WorkloadsPage/components/StatusIcon'
import Grid from '@mui/material/Unstable_Grid2'

const ddClient = createDockerDesktopClient()

export async function loader({ params }: { params: any }): Promise<HelmReleaseDetails> {
  return await findRelease(ddClient, params.name)
}

export default function WorkloadDetailsPage() {
  const release: HelmReleaseDetails = useLoaderData() as any

  return <>
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='start'>
      <Stack>
        <Stack
          direction='row'
          alignItems='center'
          spacing={ 2 }>
          <Typography variant='h2'>{ release.name }</Typography>
          <StatusIcon status={ release.status } />
          <Tooltip title='Update available'>
            <ChangeCircleOutlined color='primary' />
          </Tooltip>
        </Stack>
        <Stack
          direction='row'
          spacing={ 2 }
          sx={ { mt: 1 } }>
          <Tooltip title='Namespace'>
            <Stack 
              direction='row'
              spacing={ 0.75 }
              alignItems='center'>
              <HomeOutlined 
                fontSize='small' />
              <Typography 
                color='text.secondary'>
                { release.namespace }
              </Typography>
            </Stack>
          </Tooltip>
          <Tooltip
            title='Last updated'
            PopperProps={ {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, -4]
                  }
                }
              ]
            } }>
            <Stack
              direction='row'
              justifyContent='start'
              alignItems='center'
              spacing={ 0.5 }>
              <SyncOutlined 
                fontSize='small'
                sx={ { color: 'text.secondary' } } />
              <Typography 
                color='text.secondary'>
                { moment(release.history[release.history.length-1].updated).fromNow() }
              </Typography>
            </Stack>
          </Tooltip>
        </Stack>
      </Stack>
      <Button 
        variant='outlined' 
        startIcon={ <EditOutlined /> }>
        Edit
      </Button>
    </Stack>
    <Grid 
      container 
      spacing={ 2 }
      sx={ { mt: 2 } }>
      <Grid xs={ 4 }>
        <Card
          variant='outlined'
          sx={ { p: 2 } }>
          <Stack
            direction='row'
            spacing={ 1 }>
            <Typography color='text.secondary'>Chart name: </Typography>
            <Typography>{ release.chart }</Typography>
          </Stack>
          <Stack
            direction='row'
            spacing={ 1 }>
            <Typography color='text.secondary'>Chart version: </Typography>
            <Typography>{ release.version }</Typography>
          </Stack>
          <Stack
            direction='row'
            spacing={ 1 }>
            <Typography color='text.secondary'>App version: </Typography>
            <Typography>{ release.app_version }</Typography>
          </Stack>
        </Card>
      </Grid>
      <Grid xs={ 6 }>
        <Card
          variant='outlined'
          sx={ { p: 2 } }>
          <Stack
            direction='row'
            spacing={ 1 }>
            <Typography color='text.secondary'>Last updated: </Typography>
            <Typography>{ moment(release.history[release.history.length - 1].updated).calendar() }</Typography>
          </Stack>
          <Stack
            direction='row'
            spacing={ 1 }>
            <Typography color='text.secondary'>Namespace: </Typography>
            <Typography>{ release.namespace }</Typography>
          </Stack>
          <Stack
            direction='row'
            spacing={ 1 }>
            <Typography color='text.secondary'>Status: </Typography>
            <Typography>{ release.status }</Typography>
          </Stack>
        </Card>
      </Grid>
    </Grid>
    <Box
      sx={ {
        mt: 3,
        p: 2, 
        background: 'rgba(125, 125, 125, 0.1)',
        overflow: 'auto'
      } }>
      {
        release.notes ? 
          release.notes.split('\n')
            .filter(line => line)
            .map((line, i) => 
              <Typography 
                key={ `notes-line-${i}` } 
                variant='code' 
                component='p' 
                whiteSpace='nowrap'>{ line }</Typography>) :
          <Typography 
            variant='code' 
            component='p' 
            whiteSpace='nowrap'>This workload does not have a NOTES.txt</Typography>
      }
    </Box>
    <Stack
      direction='row'
      justifyContent='end'
      spacing={ 2 }
      sx={ { mt: 3 } }>
      <Button 
        color='error' 
        variant='text' 
        startIcon={ <Delete /> }>
        Delete
      </Button>
      <Button 
        color='primary' 
        variant='contained' 
        startIcon={ <Upgrade /> }>
        Update
      </Button>
    </Stack>
  </>
}
