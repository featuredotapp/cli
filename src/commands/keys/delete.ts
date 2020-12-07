import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class KeysDelete extends Command {
  static description = 'delete an address key'

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
  }

  static args = []

  async run() {
    const { flags } = this.parse(KeysDelete)

    const client = await setupApiClient()

    return this.delete(client, flags)
  }

  async delete(
    client: typeof api,
    flags: { address: string; key: string },
  ): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide an address: mailscript keys delete --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    if (!flags.key) {
      this.log(
        'Please provide the key id: mailscript keys delete --address example@workspace.mailscript.com --key xxx',
      )
      this.exit(1)
    }

    return handle(
      client.deleteKey(flags.address, flags.key),
      withStandardErrors(
        {
          '200': (_response: any) => {
            this.log(`Key deleted: ${flags.key}`)
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
