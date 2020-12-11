import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class Keys extends Command {
  static description = 'update an address key'

  static flags = {
    help: flags.help({ char: 'h' }),
    address: flags.string({
      char: 'a',
      description: 'the email address to look for keys against',
      required: true,
    }),
    key: flags.string({
      char: 'k',
      description: 'the id of the address key',
      required: true,
    }),
    name: flags.string({
      char: 'n',
      description: 'the name for the key',
      required: true,
    }),
    read: flags.boolean({
      char: 'r',
      default: false,
      description: 'set the key with read permissions',
    }),
    write: flags.boolean({
      char: 'w',
      default: false,
      description: 'set the key with write permissions',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(Keys)

    const client = await setupApiClient()

    await this.update(client, flags)
  }

  async update(
    client: typeof api,
    flags: {
      address: string
      key: string
      name: string
      read: boolean
      write: boolean
    },
  ): void {
    if (!flags.address) {
      this.log(
        'Please provide an address: mailscript keys update --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    if (!flags.key) {
      this.log(
        'Please provide the key id: mailscript keys update --address example@workspace.mailscript.com --key xxx',
      )
      this.exit(1)
    }

    if (!flags.write && !flags.read) {
      this.log(`A key must have either read or write permission`)
      this.exit(1)
    }

    await handle(
      client.updateKey(flags.address, flags.key, {
        name: flags.name,
        read: flags.read,
        write: flags.write,
      }),
      withStandardErrors(
        {
          '200': ({ id }: api.AddKeyResponse) => {
            this.log(`Key updated: ${id}`)
          },
          '404': ({ error }: api.ErrorResponse) => {
            this.log(error)
            this.exit(1)
          },
        },
        this,
      ),
    )
  }
}
