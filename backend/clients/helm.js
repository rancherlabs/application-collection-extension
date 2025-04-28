const { exec } = require('node:child_process')
const fs = require('fs')
const { parse } = require('yaml')

const helm = 'helm'

function getAuth() {
  const registryConfig = '/root/.config/helm/registry/config.json'
  const host = 'dp.apps.rancher.io'
  if (fs.existsSync(registryConfig)) {
    const rawConfig = fs.readFileSync(registryConfig)
    const config = JSON.parse(rawConfig)
    if (config.auths && config.auths[host] && config.auths[host]) {
      return config.auths[host].auth
    }
  }

  return null
}

async function login(username, password) {
  return new Promise((resolve, reject) => {
    exec(
      `${helm} registry login dp.apps.rancher.io -u ${username} -p ${password}`, 
      (err, stdout, stderr) => {
        if (err && stderr) {
          reject(stderr)
        } else {
          resolve(null)
        }
      })
  })
}

async function logout() {
  return new Promise((resolve, reject) => {
    exec(
      `${helm} registry logout dp.apps.rancher.io`, 
      (err, stdout, stderr) => {
        if (err && stderr) {
          reject(stderr)
        } else {
          resolve(null)
        }
      })
  })
}

async function localValues(name, version) {
  return new Promise((resolve, reject) => {
    fs.mkdtemp('application-collection', (err, tmpdir) => {
      if (err) {
        reject(err)
      } else {
        exec(
          `${helm} pull oci://dp.apps.rancher.io/charts/${name} --version ${version} --untar --untardir ${tmpdir}`, 
          (err, stdout, stderr) => {
            if (err && stderr) {
              reject(stderr)
            } else {
              if (fs.existsSync(`${tmpdir}/${name}/values.local.yaml`)) {
                fs.readFile(`${tmpdir}/${name}/values.local.yaml`, { encoding: 'utf8' }, (err, data) => {
                  if (err) {
                    reject(err)
                  } else {
                    const yaml = parse(data)
                    const flattened = flatten(yaml)
                    resolve(Object.keys(flattened).map(k => { return { key: k, value: flattened[k] } }))
                    fs.rm(tmpdir, { recursive: true, force: true }, (err) => {
                      if (err) console.error('Unexpected error removing tmp dir', err)
                    })
                  }
                })
              } else {
                resolve([])
                fs.rm(tmpdir, { recursive: true, force: true }, (err) => {
                  if (err) console.error('Unexpected error removing tmp dir', err)
                })
              }
            }
          })
      }
    })
  })
}

function flatten(data) {
  let result = {}

  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur
    } else if (Array.isArray(cur)) {

      for(let i = 0, l = cur.length; i < l; i++) {
        recurse(cur[i], prop + '[' + i + ']')
        if (l == 0) result[prop] = []
      }

    } else {
      let isEmpty = true

      for (let p in cur) {
        isEmpty = false
        recurse(cur[p], prop ? prop+'.'+p : p)
      }

      if (isEmpty && prop) result[prop] = {}
    }
  }

  recurse(data, '')

  return result
}

module.exports = { getAuth, login, logout, localValues }
