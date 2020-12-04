import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class AddressesAdd extends Command {
  static description = 'manipulate addresses'

  static flags = {
    help: flags.help({ char: 'h' }),
    address: flags.string({
      char: 'a',
      description: 'the address',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(AddressesAdd)

    const client = await setupApiClient()

    return this.add(client, flags)
  }

  async add(client: typeof api, flags: { address: string }): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide an address to add: mailscript address add --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    await handle(
      client.addAddress({ address: flags.address }),
      withStandardErrors({}, this),
    )

    const { id: key } = await handle(
      client.addKey(flags.address, {
        name: 'owner',
        read: true,
        write: true,
      }),
      withStandardErrors({}, this),
    )

    await handle(
      client.addAccessory({
        name: flags.address,
        type: 'mailscript-email',
        address: flags.address,
        key,
      }),
      withStandardErrors({}, this),
    )

    this.log(`Address added: ${flags.address}`)
  }
}
