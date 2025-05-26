import { CheckCircleOutline, HighlightOffOutlined, DownloadingOutlined } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import { WorkloadStatus } from '../../../clients/helm'

export default function StatusIcon({ status }: { status: WorkloadStatus }) {
  switch (status) {
    case WorkloadStatus.Running:
      return <Tooltip title='Running'>
        <CheckCircleOutline color='secondary' />
      </Tooltip>
    case WorkloadStatus.Error:
      return <Tooltip title='Error'>
        <HighlightOffOutlined color='error' />
      </Tooltip>
    case WorkloadStatus.Loading:
      return <Tooltip title='Installing'>
        <DownloadingOutlined />
      </Tooltip>
  }
}