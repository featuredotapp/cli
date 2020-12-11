import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class AddressesDelete extends Command {
  static description = 'delete an email address'

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
    const { flags } = this.parse(AddressesDelete)

    const client = await setupApiClient()

    await this.delete(client, flags)
  }

  async delete(client: typeof api, flags: { address: string }): void {
    if (!flags.address) {
      this.log(
        'Please provide the address: mailscript addresses delete --address <smith@example.com>',
      )
      this.exit(1)
    }

    await handle(
      client.deleteAddress(flags.address),
      withStandardErrors(
        {
          '204': (_response: any) => {
            this.log(`Address deleted: ${flags.address}`)
          },
        },
        this,
      ),
    )
  }
}
