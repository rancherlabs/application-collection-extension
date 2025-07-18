import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Alert, Box, Button, Card, Grid, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import { Link, useLoaderData, useNavigate } from 'react-router-dom'
import { findRelease, HelmListItem, HelmReleaseDetails } from '../../clients/helm'
import { ChangeCircleOutlined, Delete, EditOutlined, HomeOutlined, LanOutlined, SyncOutlined, Upgrade } from '@mui/icons-material'
import moment from 'moment'
import StatusIcon from '../WorkloadsPage/components/StatusIcon'
import { useEffect, useState } from 'react'
import { ArtifactListItemReducedDTO, ArtifactListItemReducedDTOPackagingFormatEnum, BranchDTO } from '../../../autogenerated/client/backend'
import { useAuth } from '../../AuthContext'
import { componentsClient } from '../../clients/backend'
import { compareVersions } from '../../clients/util'
import HistoryTimeLine from './components/HistoryTimeLine'
import { getServices } from '../../clients/kubectl'
import { V1ServicePort, V1ServiceSpec } from '@kubernetes/client-node'
import UpgradeDialog from '../../components/Helm/UpgradeDialog'
import UninstallDialog from '../../components/Helm/UninstallDialog'
import EditDialog from '../../components/Helm/EditDialog'

type PortMapping = {
  targetPort: number;
  nodePort: number;
  protocol: string;
}

const ddClient = createDockerDesktopClient()

export async function loader({ params }: { params: any }): Promise<HelmReleaseDetails | null> {
  try {
    return await findRelease(ddClient, params.name)
  } catch (e) {
    return null
  }
}

export default function WorkloadDetailsPage() {
  const [ release, setRelease ] = useState<HelmReleaseDetails | null>(useLoaderData() as any)
  const [ portMappings, setPortMappings ] = useState<PortMapping[]>([])
  const [ update, setUpdate ] = useState<ArtifactListItemReducedDTO | null>()
  const [ editDialogOpen, setEditDialogOpen ] = useState<boolean>(false)
  const [ updateDialogOpen, setUpdateDialogOpen ] = useState<boolean>(false)
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState<boolean>(false)

  const navigate = useNavigate()
  const auth = useAuth()

  useEffect(() => {
    function appSlugName(name: string): string {
      const chunks = name.split('-')
      return chunks.filter((chunk, i) => i < chunks.length - 1).join('-')
    }

    if (release) {
      getServices(ddClient, [{ key: 'app.kubernetes.io/instance', value: release.name }], release.namespace)
        .then(chartServices => {
          const mappings: PortMapping[] = chartServices
            .filter(s => s.spec && s.spec.type === 'NodePort' && s.spec.ports)
            .flatMap(nodePort => ((nodePort.spec as V1ServiceSpec).ports as V1ServicePort[])
              .flatMap(port => {
                return {
                  targetPort: port.targetPort as number,
                  nodePort: port.nodePort as number,
                  protocol: port.protocol as string
                }
              })
            )
        
          setPortMappings(mappings)
        })
    
      componentsClient(auth || null).getComponent(appSlugName(release.name))
        .then(response => {
          const component = response.data

          const currentBranch = component.branches.find(branch => release.app_version.match(new RegExp(branch.branch_pattern))) as BranchDTO
          const newVersion = currentBranch.versions?.find(version => compareVersions(version.version_number, release.app_version) > 0 &&
          version.artifacts.find(artifact => artifact.packaging_format === ArtifactListItemReducedDTOPackagingFormatEnum.HelmChart))
            ?.artifacts.find(artifact => artifact.packaging_format === ArtifactListItemReducedDTOPackagingFormatEnum.HelmChart)
        
          if (newVersion) {
            setUpdate(newVersion)
          } else {
            const newBranch = component.branches.find(branch => branch !== currentBranch && 
          branch.versions && 
          branch.versions.length > 0 && 
          branch.versions.find(version => compareVersions(version.version_number, release.app_version) > 0))
            const newBranchVersion = newBranch?.versions?.flatMap(version => version.artifacts)
              .find(artifact => artifact.packaging_format === ArtifactListItemReducedDTOPackagingFormatEnum.HelmChart)
        
            if (newBranchVersion) {
              setUpdate(newBranchVersion)
            } else {
              setUpdate(null)
            }
          }
        })
        .catch((e) => console.error('Unexpected error fetching component data', e))
    }
  }, [release])
  
  function onUpdate(newRelease: HelmListItem) {
    setUpdate(undefined)
    if (release) {
      findRelease(ddClient, release.name)
        .then(details => setRelease(details))
    }
  }

  function onDelete() {
    navigate(-1)
  }

  if (!release) {
    return <>
      <Typography variant='h2' gutterBottom>Workload not found!</Typography>
      <Typography gutterBottom>This release does no longer exist. Maybe it lives in a different kubernetes context or you deleted it at some point.</Typography>
      <Typography>Click <Link to='/workloads'>here</Link> to go back.</Typography>
    </>
  }


  return <>
    <Stack direction='row' alignItems='start' justifyContent='space-between'>
      <Stack>
        <Stack direction='row' alignItems='center' spacing={ 2 }>
          <Typography variant='h2'>{ release.name }</Typography>
          <StatusIcon status={ release.status } />
          { update && <Tooltip title='Update available'><ChangeCircleOutlined color='primary' /></Tooltip> }
        </Stack>
        <Stack direction='row' spacing={ 2 } sx={ { mt: 1 } }>
          <Tooltip title='Namespace'>
            <Stack direction='row' alignItems='center' spacing={ 0.75 }>
              <HomeOutlined fontSize='small' />
              <Typography color='text.secondary'>{ release.namespace }</Typography>
            </Stack>
          </Tooltip>
          <Tooltip
            title='Last updated'
            slotProps={ { 
              popper:{
                modifiers: [
                  {
                    name: 'offset',
                    options: { offset: [0, -4] }
                  }
                ]
              }
            } }>
            <Stack direction='row' alignItems='center' justifyContent='start' spacing={ 0.5 }>
              <SyncOutlined fontSize='small' sx={ { color: 'text.secondary' } } />
              <Typography color='text.secondary'>{ moment(release.history[release.history.length-1].updated).fromNow() }</Typography>
            </Stack>
          </Tooltip>
        </Stack>
      </Stack>
      <Button variant='outlined' startIcon={ <EditOutlined /> } onClick={ () => setEditDialogOpen(true) }>Edit</Button>
    </Stack>
    {
      release.history[release.history.length - 1].status === 'failed' && 
      <Alert severity='error' sx={ { mt: 3 } } icon={ false }>
        <Typography>{ release.history[release.history.length - 1].description }</Typography>
      </Alert>
    }
    <Grid container rowSpacing={ 3 } columnSpacing={ 2 } sx={ { mt: 2 } }>
      <Grid size={ { xs: 6 } }>
        <Stack direction='row' spacing={ 1 }>
          <Typography color='text.secondary'>Chart name: </Typography>
          <Typography>{ release.chart }</Typography>
        </Stack>
        <Stack direction='row' spacing={ 1 }>
          <Typography color='text.secondary'>Chart version: </Typography>
          <Typography>{ release.version }</Typography>
        </Stack>
        <Stack direction='row' spacing={ 1 }>
          <Typography color='text.secondary'>App version: </Typography>
          <Typography>{ release.app_version }</Typography>
        </Stack>
      </Grid>
      <Grid size={ { xs: 6 } }>
        <Stack direction='row' spacing={ 1 }>
          <Typography color='text.secondary'>Last updated: </Typography>
          <Typography>{ moment(release.history[release.history.length - 1].updated).calendar() }</Typography>
        </Stack>
        <Stack direction='row' spacing={ 1 }>
          <Typography color='text.secondary'>Namespace: </Typography>
          <Typography>{ release.namespace }</Typography>
        </Stack>
        <Stack direction='row' spacing={ 1 }>
          <Typography color='text.secondary'>Status: </Typography>
          <Typography>{ release.status }</Typography>
        </Stack>
      </Grid>
      <Grid size={ { xs: 6 } }>
        <Card variant='outlined' sx={ { p: 2 } }>
          <Typography variant='body1' fontWeight='500' sx={ { mb: 1 } }>Port mappings</Typography>
          { 
            portMappings.map((portMapping, i) => 
              <Stack 
                key={ `portMapping-${i}` }
                direction='row'
                spacing={ 0.75 }
                alignItems='center'>
                <LanOutlined fontSize='small' />
                <Typography 
                  color='text.secondary'>
                  { portMapping.nodePort } : { portMapping.targetPort.toString().toUpperCase() } ({ portMapping.protocol })
                </Typography>
              </Stack>
            ) 
          }
        </Card>
      </Grid>
    </Grid>
    <HistoryTimeLine history={ release.history } />
    <Box
      sx={ {
        mt: 2,
        p: 2, 
        background: 'rgba(125, 125, 125, 0.1)',
        overflow: 'auto'
      } }>
      {
        release.notes ? 
          release.notes.split('\n')
            .filter(line => line)
            .map((line, i) => 
              <Typography key={ `notes-line-${i}` } variant='code' component='p' whiteSpace='nowrap'>{ line }</Typography>) :
          <Typography variant='code' component='p' whiteSpace='nowrap'>This workload does not have a NOTES.txt</Typography>
      }
    </Box>
    <Stack direction='row' justifyContent='space-between' spacing={ 2 } sx={ { mt: 3 } }>
      <Button color='error' variant='text' startIcon={ <Delete /> } onClick={ () => setDeleteDialogOpen(true) }>Delete</Button>
      { update === undefined ?
        <Skeleton variant='rounded' width={ 102 }  height={ 32 } /> : 
        update && <Button color='primary' variant='contained' startIcon={ <Upgrade /> } onClick={ () => setUpdateDialogOpen(true) }>Update</Button> }
    </Stack>
    { update && <UpgradeDialog 
      artifact={ update }
      workload={ release }
      open={ updateDialogOpen }
      onSubmit={ (result) => {
        onUpdate(result) 
        setUpdateDialogOpen(false)
      } }
      onClose={ () => setUpdateDialogOpen(false) } /> }
    <EditDialog 
      workload={ release }
      open={ editDialogOpen }
      onSubmit={ (result) => {
        onUpdate(result)
        setEditDialogOpen(false)
      } }
      onClose={ () => setEditDialogOpen(false) } />
    <UninstallDialog 
      name={ release.name }
      namespace={ release.namespace }
      open={ deleteDialogOpen }
      onSubmit={ () => {
        onDelete()
        setDeleteDialogOpen(false)
      } }
      onClose={ () => setDeleteDialogOpen(false) } />
  </>
}
