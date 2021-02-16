import { Command, flags } from '@oclif/command'
import WebSocket from 'ws'
import { promise as exec } from 'exec-sh'
import setupApiClient from '../setupApiClient'
import { handle } from 'oazapfts'
import withStandardErrors from '../utils/errorHandling'
import traverse from 'traverse'

const {
  MAILSCRIPT_DAEMON_BRIDGE_URL = 'wss://mailscript-daemon-bridge.herokuapp.com',
} = process.env

const PING_DELAY = 15 * 60 * 1000
const AUTO_RECONNECT_DELAY = 1000

export default class Daemon extends Command {
  static description = 'Run a daemon to execute scripts on email arrival'

  static flags = {
    help: flags.help({ char: 'h' }),
    daemon: flags.string({
      required: true,
      description: 'the name of the daemon to register as',
    }),
    command: flags.string({
      required: true,
      description:
        'The shell command to run on message received. The parts of the email will be injected as environment variable: $subject, $text, $html and $payload',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(Daemon)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    const { token } = await handle(
      client.getDaemonToken(flags.daemon),
      withStandardErrors({}, this),
    )

    this.connectWebsocket(token, flags.command, true)
  }

  connectWebsocket(token: string, command: string, first = false) {
    this.debug('Connecting to daemon bridge: %s', MAILSCRIPT_DAEMON_BRIDGE_URL)
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
      if (first) {
        this.log('Listening for emails ...')
      }

      ws.send(token)

      ping()
    })

    ws.on('ping', ping)

    ws.on('message', async (data: string) => {
      const {
        subject,
        text,
        html,
        payload,
      }: {
        subject: string
        text: string
        html: string
        payload: any
      } = JSON.parse(data)

      const sanitizedPayload = traverse(payload).map(function (node) {
        if (typeof node === 'string' || node instanceof String) {
          this.update(node.replace(/\r?\n/g, '\\n'))
        }

        return undefined
      })

      const jsonString = JSON.stringify(sanitizedPayload, null, 2)

      const out = await exec(command, {
        env: { subject, text, html, payload: jsonString },
      })

      this.log(out.stdout)
    })

    ws.on('close', () => {
      ws.terminate()
      this.debug('Remote close')
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      clearTimeout(ws.pingTimeout)
      setTimeout(() => {
        ws.removeAllListeners()

        this.debug('Reconnecting ...')
        this.connectWebsocket(token, command)
      }, AUTO_RECONNECT_DELAY)
    })

    ws.on('error', (err) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      if (err.code === 'ECONNREFUSED') {
        ws.removeAllListeners()

        this.log('Connection refused')
        return setTimeout(() => {
          this.log('Reconnecting ...')
          this.connectWebsocket(token, command)
        }, AUTO_RECONNECT_DELAY)
      }

      ws.terminate()
      this.error(err)
    })

    return ws
  }
}
