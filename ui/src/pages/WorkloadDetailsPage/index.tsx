import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Typography } from '@mui/material'
import { useLoaderData } from 'react-router-dom'
import { findRelease, HelmReleaseDetails } from '../../clients/helm'

const ddClient = createDockerDesktopClient()

export async function loader({ params }: { params: any }): Promise<HelmReleaseDetails> {
  return await findRelease(ddClient, params.name)
}

export default function WorkloadDetailsPage() {
  const release: HelmReleaseDetails = useLoaderData() as any

  return <>
    <Typography variant='h2'>{ release.name }</Typography>
    <Typography>{ release.version }</Typography>
    <Typography>{ release.app_version }</Typography>
    {
      release.history.map((line, i) => 
        <Typography key={ `history-line-${i}` }>
          { line.description }
        </Typography>
      )
    }
  </>
}
