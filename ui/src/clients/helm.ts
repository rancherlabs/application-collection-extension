import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'
import { ArtifactDTO, ArtifactListItemReducedDTO } from '../../autogenerated/client/backend'
import { findKubernetesSecret } from './kubectl'

export const WorkloadStatus = {
  NotRunning: 'NotRunning',
  Running: 'Running',
  Loading: 'Loading',
  Error: 'Error'
}

export type WorkloadStatus = typeof WorkloadStatus[keyof typeof WorkloadStatus]

const HelmReleaseStatus = {
  Deployed: 'deployed',
  Unknown: 'unknown',
  Uninstalled: 'uninstalled',
  Superseded: 'superseded',
  Failed: 'failed',
  Uninstalling: 'uninstalling',
  PendingInstall: 'pending-install',
  PendingUpgrade: 'pending-upgrade',
  PendingRollback: 'pending-rollback'
}

type HelmReleaseStatus = typeof HelmReleaseStatus[keyof typeof HelmReleaseStatus]

export type HelmListItem = {
  app_version: string,
  chart: string,
  name: string,
  namespace: string,
  status: WorkloadStatus,
  version: string,
  notes?: string
} 

type HelmHistoryItem = {
  app_version: string,
  description: string
}

type HelmInstall = {
  name: string,
  namespace: string,
  info: {
    status: HelmReleaseStatus,
    notes: string
  },
  chart: {
    metadata: {
      appVersion: string
    }
  }
}

const MATCHER = 'source=application-collection-extension'

type Description = {
  message: string
  version: string,
  revision: string,
  digest: string
  branch?: string
}

function mapStatus(status: HelmReleaseStatus): WorkloadStatus {
  switch (status) {
    case 'superseded':
    case 'deployed':
      return WorkloadStatus.Running
    case 'unknown':
    case 'failed':
      return WorkloadStatus.Error
    case 'uninstalling':
    case 'pending-install':
    case 'pending-upgrade':
    case 'pending-rollback':
      return WorkloadStatus.Loading
    case 'uninstalled':
    default:
      return WorkloadStatus.NotRunning
  }
}

export async function helmLogout(ddClient: DockerDesktopClient): Promise<void> {
  await ddClient.extension.host?.cli.exec('helm', [
    'registry', 'logout', 'dp.apps.rancher.io/charts'
  ])
}

export async function helmLogin(ddClient: DockerDesktopClient, username: string, token: string): Promise<void> {
  await ddClient.extension.host?.cli.exec('helm', [
    'registry', 'login', 'dp.apps.rancher.io/charts',
    '-u', username,
    '-p', token
  ])
}

export async function findAllHelmCharts(ddClient: DockerDesktopClient): Promise<HelmListItem[]> {
  return new Promise((resolve, reject) => {
    ddClient.extension.host?.cli.exec('helm', ['version'])
      .then(() => {
        ddClient.extension.host?.cli.exec('helm', [ 'list', '-a', '-A', '-o', 'json', '-l', MATCHER])
          .then(async (listResult) => {
            const list: HelmListItem[] = JSON.parse(listResult.stdout)
            const releases = list.map(release => {
              return {
                ...release,
                status: mapStatus(release.status),
                version: release.chart.substring(release.chart.lastIndexOf('-') + 1)
              }
            })
            resolve(releases.filter(r => r !== undefined) as HelmListItem[])
          })
          .catch(e => console.error('Unexpected error listing helm releases', e))
      })
      .catch(() => {
        reject('helm required on host machine')
      })
  })
}

export async function findHelmChart(ddClient: DockerDesktopClient, componentName: string, branchPattern: RegExp): Promise<HelmListItem | undefined> {
  return new Promise((resolve, reject) => {
    ddClient.extension.host?.cli.exec('helm', ['version'])
      .then(() => {
        ddClient.extension.host?.cli.exec('helm', [ 'list', '-a', '-A', '-o', 'json', '-l', MATCHER ])
          .then(async (listResult) => {
            const list: HelmListItem[] = JSON.parse(listResult.stdout)
            let result: HelmListItem | undefined

            for (const release of list.filter(release => release.chart.startsWith(componentName))) {
              const historyResult = await ddClient.extension.host?.cli.exec('helm', [ 'history', '-o', 'json', '-n', release.namespace, release.name ])
    
              if (historyResult) {
                const history: HelmHistoryItem[] = JSON.parse(historyResult.stdout)
                const lastRevision = history[history.length - 1]
                if (branchPattern.test(lastRevision.app_version)) {
                  result = {
                    ...release,
                    status: mapStatus(release.status),
                    version: release.chart.substring(release.chart.lastIndexOf('-') + 1)
                  }
                  break
                }
              }
            }

            resolve(result)
          })
          .catch(e => console.error('Unexpected error listing helm releases', e))
      })
      .catch(() => {
        reject('helm required on host machine')
      })
  })
}

export async function installHelmChart(
  ddClient: DockerDesktopClient, 
  branchName: string, 
  artifact: ArtifactListItemReducedDTO | ArtifactDTO, 
  version: string, 
  values: { key: string, value:string }[] = [{ key: 'global.imagePullSecrets[0].name', value: 'application-collection' }]
): Promise<HelmListItem> {

  return new Promise((resolve, reject) => {
    findKubernetesSecret(ddClient)
      .then(async (isSecretStored) => {
        if (!isSecretStored) {
          reject('Secret application-collection does not exist. Please refresh the authentication settings.')
        } else {
          const description: Description = {
            message: 'Generated by Application Collection extension',
            branch: branchName,
            version: artifact.version as string,
            revision: artifact.revision,
            digest: artifact.digest.value
          }

          let stdout = ''
          let stderr = ''

          ddClient.extension.host?.cli.exec('helm', [ 
            'install', `oci://dp.apps.rancher.io/charts/${artifact.name.split(':')[0]}`, 
            '--version', artifact?.version as string, 
            '--set', 'global.imagePullSecrets[0].name=application-collection',
            ...values.flatMap(v => ['--set', v.key + '=' + v.value ]),
            '--description', JSON.stringify(description),
            '--generate-name',
            '-l', MATCHER,
            '-o', 'json', ], {
            stream: { 
              onOutput: (installResult) => {
                if (installResult.stdout) {
                  stdout += installResult.stdout
                } else {
                  stderr += installResult.stderr
                }
              },
              onError: (e) => {
                console.error('Unexpected error installing release', e)
                reject(e)
              },
              onClose: (code) => {
                if (code > 0) {
                  console.error(`Unexpected exit code installing release [code=${code}, stderr=${stderr}, stdout=${stdout}]`)
                  reject (stderr)
                } else {
                  const install = JSON.parse(stdout)
                  resolve({
                    name: install.name,
                    namespace: install.namespace,
                    status: mapStatus(install.info.status),
                    app_version: version,
                    chart: `${artifact.name.split(':')[0]}-${artifact.version}`,
                    version: artifact.version as string,
                    notes: install.info.notes
                  })      
                }
              },
            } })
        }
      })
  })
}

export async function upgradeHelmChart(
  ddClient: DockerDesktopClient, 
  artifact: ArtifactListItemReducedDTO | ArtifactDTO, 
  release: HelmListItem,
  values: { key: string, value:string }[] = [{ key: 'global.imagePullSecrets[0].name', value: 'application-collection' }]
): Promise<HelmListItem> {
  return new Promise((resolve, reject) => {
    findKubernetesSecret(ddClient)
      .then((isSecretStored) => {
        if (!isSecretStored) {
          reject('Secret application-collection does not exist. Please refresh the authentication settings.')
        } else {
          const description: Description = {
            message: `Upgrade from ${release.version} to ${artifact.version}`,
            version: artifact.version as string,
            revision: artifact.revision,
            digest: artifact.digest.value
          }
          ddClient.extension.host?.cli.exec('helm', [ 
            'upgrade', release.name, `oci://dp.apps.rancher.io/charts/${artifact.name.split(':')[0]}`, 
            '-n', release.namespace,
            '--version', artifact?.version as string, 
            ...values.flatMap(v => ['--set', v.key + '=' + v.value ]),
            '--description', `'${JSON.stringify(description)}'`,
            '-o', 'json' ], { })
            .then(upgradeResult => {
              const upgrade: HelmInstall = JSON.parse(upgradeResult.stdout)
              resolve({
                name: upgrade.name,
                namespace: upgrade.namespace,
                status: mapStatus(upgrade.info.status),
                app_version: upgrade.chart.metadata.appVersion,
                chart: `${artifact.name.split(':')[0]}-${artifact.version}`,
                version: artifact.version as string
              })
            })
            .catch(e => {
              console.error('Unexpected error upgrading release', e)
              reject('Unexpected error upgrading release')
            })

        }
      })
  })
}

export async function uninstallHelmChart(ddClient: DockerDesktopClient, name: string, namespace: string = 'default'): Promise<void> {
  return new Promise((resolve, reject) => {
    ddClient.extension.host?.cli.exec('helm', [
      'uninstall', name,
      '-n', namespace,
      '--wait'])
      .then(() => {
        resolve()
      })
      .catch(e => {
        console.error(`Unexpected exception uninstalling relese [name=${name}, namespace=${namespace}]`, e)
        reject('Unexpected exception uninstalling relese')
      })
  })
}