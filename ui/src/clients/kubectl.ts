import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'
import { V1Service } from '@kubernetes/client-node'

export async function checkKubernetes(ddClient: DockerDesktopClient): Promise<void> {
  await ddClient.extension.host?.cli.exec('kubectl', [
    'get', 'nodes'
  ])
}

export async function kubernetesLogout(ddClient: DockerDesktopClient): Promise<void> {
  await ddClient.extension.host?.cli.exec('kubectl', [
    'delete', 'secret', 'application-collection',
    '--wait'
  ])
}
  
export async function kubernetesLogin(ddClient: DockerDesktopClient, username: string, token: string): Promise<void> {
  await ddClient.extension.host?.cli.exec('kubectl', [
    'create', 'secret', 'docker-registry', 'application-collection',
    '--docker-server', 'dp.apps.rancher.io',
    '--docker-username', username,
    '--docker-password', token
  ])
}

type KubernetesResult = {
  metadata: {
    name: string
  }
}

export async function findKubernetesSecret(ddClient: DockerDesktopClient): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    ddClient.extension.host?.cli.exec('kubectl', [
      'get', 'secret', 'application-collection',
      '-o', 'json'])
      .then(getResult => {
        const get: KubernetesResult = JSON.parse(getResult?.stdout)
        resolve(get.metadata.name === 'application-collection')
      })
      .catch((e) => {
        console.error('Unexpected error checking if application-collection secret exists', e)
        resolve(false)
      })
  })
}

export async function getServices(ddClient: DockerDesktopClient, selectors: { key: string, value: string }[]): Promise<V1Service[]> {
  return new Promise<V1Service[]>((resolve, reject) => {
    ddClient.extension.host?.cli.exec('kubectl', [
      'get', 'services', ...selectors.flatMap(({ key, value }) => ['-l', `${key}=${value}`]),
      '-o', 'json'])
      .then(getResult => {
        const get: any = JSON.parse(getResult?.stdout)
        resolve(get.items as V1Service[])
      })
      .catch((e) => {
        reject('Unexpected error getting services')
      })
  })
}
