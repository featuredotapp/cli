import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export async function addAddress(
  client: typeof api,
  command: Command,
  address: string,
  displayName?: string,
) {
  await handle(
    client.addAddress({ address, displayName }),
    withStandardErrors({}, command),
  )

  return { address }
}

export default class AddressesAdd extends Command {
  static description = 'add an email address'

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
      required: false,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(AddressesAdd)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.add(client, flags)
  }

  async add(
    client: typeof api,
    flags: { address: string; name?: string },
  ): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide an address to add: mailscript address add --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    await addAddress(client, this, flags.address, flags.name)

    this.log(`Address added: ${flags.address}`)
  }
}
