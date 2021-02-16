import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class IntegrationsList extends Command {
  static description = 'list the integrations'

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
      client.getAllIntegrations(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllIntegrationsResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have an integration currently, create one with: mailscript integrations:add`,
              )

              this.exit(0)
            }

            this.log('')
            this.log(chalk.bold('Integrations'))
            this.log('')

            cli.table(
              list.sort((a: api.Integration, b: api.Integration) => {
                return a.type.localeCompare(b.type)
              }),
              {
                name: {
                  header: 'Type',
                  get: (row) => row.type,
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
