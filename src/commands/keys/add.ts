import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class KeysAdd extends Command {
  static description = 'add an address key'

  static flags = {
    help: flags.help({ char: 'h' }),
    address: flags.string({
      char: 'a',
      description: 'the email address to look for keys against',
      required: true,
    }),
    name: flags.string({
      char: 'n',
      description: 'the name for the key',
      required: true,
    }),
    read: flags.boolean({
      char: 'r',
      description: 'set the key with read permissions',
      default: false,
    }),
    write: flags.boolean({
      char: 'w',
      description: 'set the key with write permissions',
      default: false,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(KeysAdd)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.add(client, flags)
  }

  async add(
    client: typeof api,
    flags: { address: string; name: string; write: boolean; read: boolean },
  ): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide an address: mailscript keys add --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    if (!flags.name) {
      this.log(
        'Please provide a name: mailscript keys add --address example@workspace.mailscript.com --name ci',
      )
      this.exit(1)
    }

    if (!flags.write && !flags.read) {
      this.log(`A key must have either read or write permission`)
      this.exit(1)
    }

    return handle(
      client.addKey(flags.address, {
        name: flags.name,
        read: flags.read,
        write: flags.write,
      }),
      withStandardErrors(
        {
          '201': ({ id }: api.AddKeyResponse) => {
            this.log(`Key added: ${id}`)
          },
          '404': () => {
            this.log(`Unknown address: ${flags.address}`)
            this.exit(1)
          },
        },
        this,
      ),
    )
  }
}
