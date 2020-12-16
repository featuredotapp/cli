import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import { cli } from 'cli-ux'

export default class AccessoriesList extends Command {
  static description = 'list the accessories'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.list(client)
  }

  async list(client: typeof api): Promise<void> {
    return handle(
      client.getAllAccessories(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllAccessoriesResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have a accessories currently, create an address to add one: mailscript addresses:add --address example@workspace.mailscript.com`,
              )
              this.exit(0)
            }

            this.log('')
            this.log('Accessories')
            this.log('')

            cli.table(
              list,
              {
                name: {
                  header: 'Name',
                  get: (row) => row.name,
                },
                id: {
                  header: 'Id',
                  get: (row) => row.id,
                },
                type: {
                  header: 'Type',
                  get: (row) => row.type,
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
