import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class AddressesUpdate extends Command {
  static description = 'update an email address'

  static flags = {
    help: flags.help({ char: 'h' }),
    address: flags.string({
      char: 'a',
      description: 'the address',
      required: true,
    }),
    name: flags.string({
      char: 'n',
      description: 'the display name that email recipients will see',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(AddressesUpdate)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.update(client, flags)
  }

  async update(
    client: typeof api,
    flags: { address: string; name: string },
  ): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide an address to add: mailscript address add --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    if (!flags.name) {
      this.log(
        'Please provide a name to update: mailscript address:update --name example',
      )
      this.exit(1)
    }

    await handle(
      client.updateAddress(flags.address, { displayName: flags.name }),
      withStandardErrors(
        {
          '200': () => {
            this.log(`Address updated: ${flags.address}`)
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
