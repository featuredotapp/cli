import { readFile as readFileRaw } from 'fs'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'
import nodeFetch from 'node-fetch'
import * as api from './api'

const readFile = promisify(readFileRaw)

const {
  MAILSCRIPT_CONFIG_PATH = path.join(os.homedir(), '.mailscript'),
  MAILSCRIPT_API_SERVER = undefined,
} = process.env

async function setupApiClient(): Promise<typeof api> {
  const config = await readFile(MAILSCRIPT_CONFIG_PATH)
  const { apiKey } = JSON.parse(config.toString())

  api.defaults.headers = {
    Authorization: `bearer ${apiKey}`,
  }

  api.defaults.fetch = nodeFetch as any

  if (MAILSCRIPT_API_SERVER) {
    api.defaults.baseUrl = MAILSCRIPT_API_SERVER
  }

  return api
}

export default setupApiClient
