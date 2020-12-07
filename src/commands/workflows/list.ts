import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import { cli } from 'cli-ux'

export default class Workflows extends Command {
  static description = 'list the workflows'

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
      client.getAllWorkflows(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllWorkflowsResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have an workflow currently, create one with: mailscript workflows add`,
              )
              this.exit(0)
            }

            this.log('')
            this.log('Workflows')
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
