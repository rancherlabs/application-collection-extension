import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1'

export async function checkDocker(ddClient: DockerDesktopClient): Promise<void> {
  await ddClient.docker.cli.exec('info', [])
}

export async function dockerLogout(ddClient: DockerDesktopClient): Promise<void> {
  await ddClient.docker.cli.exec('logout', [ 
    'dp.apps.rancher.io' 
  ])
}
  
export async function dockerLogin(ddClient: DockerDesktopClient, username: string, token: string): Promise<void> {
  await ddClient.docker.cli.exec('login', [
    'dp.apps.rancher.io/containers',
    '-u', username,
    '-p', token
  ])
}