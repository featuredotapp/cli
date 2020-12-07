import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import { cli } from 'cli-ux'

export default class AddressesList extends Command {
  static description = 'list your email addresses'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    const client = await setupApiClient()

    return this.list(client)
  }

  async list(client: typeof api): Promise<void> {
    return handle(
      client.getAllAddresses(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllAddressesResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have any addresses currently, create one with: mailscript addresses add`,
              )
              this.exit(0)
            }

            this.log('')
            this.log('Addresses')
            this.log('')

            cli.table(
              list,
              {
                name: {
                  header: 'Address',
                  get: (row) => row.id,
                },
              },
              { printLine: this.log },
            )
          },
        },
        this,
      ),
    )
  }
}
