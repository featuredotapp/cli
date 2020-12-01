import { Command, flags } from '@oclif/command'
import * as WebSocket from 'ws'
import { JWT, JWK } from 'jose'
import { promise as exec } from 'exec-sh'

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
    const token = JWT.sign({ accessoryId: flags.accessory }, JWK.None)

    const ws = new WebSocket('ws://localhost:8888', {
      headers: {
        Authorization: `bearer ${token}`,
      },
    })

    ws.on('open', () => {
      this.log('Listenening for emails ...')

      ws.send(token)
    })

    ws.on('message', async (data: any) => {
      const out = await exec(flags.command, { env: { subject: data } })

      this.log(out.stdout)
    })
  }
}
