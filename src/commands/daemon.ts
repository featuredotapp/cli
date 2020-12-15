import { Command, flags } from '@oclif/command'
import WebSocket from 'ws'
import { promise as exec } from 'exec-sh'
import setupApiClient from '../setupApiClient'
import { handle } from 'oazapfts'
import withStandardErrors from '../utils/errorHandling'
import * as api from '../api'
import chalk from 'chalk'

const {
  MAILSCRIPT_DAEMON_BRIDGE_URL = 'wss://mailscript-daemon-bridge.herokuapp.com:80',
} = process.env

const PING_DELAY = 15 * 60 * 1000
const AUTO_RECONNECT_DELAY = 1000

export default class Daemon extends Command {
  static description = 'Run a daemon to execute scripts on email arrival'

  static flags = {
    help: flags.help({ char: 'h' }),
    accessory: flags.string({
      required: true,
      description: 'the accessory to listen in on',
    }),
    command: flags.string({
      required: true,
      description: 'The shell command to run on message received',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(Daemon)

    const client = await setupApiClient()

    const { list: accessories }: { list: Array<api.Accessory> } = await handle(
      client.getAllAccessories(),
      withStandardErrors({}, this),
    )

    const daemonAccessory = accessories.find(
      (acc) => acc.name === flags.accessory || acc.id === flags.accessory,
    )

    if (!daemonAccessory) {
      this.log(
        chalk.red(
          `${chalk.bold('Error')}: the accessory ${chalk.bold(
            flags.accessory,
          )} does not exist`,
        ),
      )
      this.exit(1)
    }

    if (daemonAccessory.type !== 'daemon') {
      this.log(
        chalk.red(
          `${chalk.bold('Error')}: the accessory ${chalk.bold(
            flags.accessory,
          )} is not a daemon`,
        ),
      )
      this.exit(1)
    }

    const { token } = await handle(
      client.getAccessoryToken(daemonAccessory.id),
      withStandardErrors({}, this),
    )

    this.connectWebsocket(token, flags.command)
  }

  connectWebsocket(token: string, command: string) {
    const ws = new WebSocket(MAILSCRIPT_DAEMON_BRIDGE_URL, {
      headers: {
        Authorization: `bearer ${token}`,
      },
    })

    const heartbeat = (ws: WebSocket, delay: number) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      clearTimeout(ws.pingTimeout)

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      ws.pingTimeout = setTimeout(() => {
        ws.terminate()
      }, delay)
    }

    const ping = () => {
      heartbeat(ws, PING_DELAY)
    }

    ws.on('open', () => {
      this.log('Listenening for emails ...')

      ws.send(token)

      ping()
    })

    ws.on('ping', ping)

    ws.on('message', async (data: string) => {
      const { subject, text }: { subject: string; text: string } = JSON.parse(
        data,
      )

      const out = await exec(command, { env: { subject, text } })

      this.log(out.stdout)
    })

    ws.on('close', () => {
      ws.terminate()
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      clearTimeout(ws.pingTimeout)
      setTimeout(() => {
        ws.removeAllListeners()

        // Start connection again
        this.connectWebsocket(token, command)
      }, AUTO_RECONNECT_DELAY)
    })

    ws.on('error', (err) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      if (err.code === 'ECONNREFUSED') {
        ws.removeAllListeners()

        return
      }

      ws.terminate()
    })

    return ws
  }
}
