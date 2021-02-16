import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import sortByNameAsc from '../../utils/sortByNameAsc'

export default class TriggersList extends Command {
  static description = 'list the triggers'

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
      client.getAllTriggers(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllTriggersResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have a trigger currently, create one with: mailscript triggers:add`,
              )

              this.exit(0)
            }

            this.log('')
            this.log(chalk.bold('Triggers'))
            this.log('')

            cli.table(
              list.sort(sortByNameAsc),
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
