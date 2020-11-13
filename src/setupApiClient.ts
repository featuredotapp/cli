import { readFile as readFileRaw } from 'fs'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'
import nodeFetch from 'node-fetch'
import * as api from './api'

const readFile = promisify(readFileRaw)

async function setupApiClient(): Promise<typeof api> {
  // api.defaults.baseUrl = 'https://example.com/api'
  const config = await readFile(path.join(os.homedir(), '.mailscript'))
  const { apiKey } = JSON.parse(config.toString())

  api.defaults.headers = {
    Authorization: `bearer ${apiKey}`,
  }

  api.defaults.fetch = nodeFetch as any

  return api
}

export default setupApiClient
