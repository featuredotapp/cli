import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import { cli } from 'cli-ux'
import chalk from 'chalk'

export default class SmsList extends Command {
  static description = 'list your sms numbers'

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
      client.getAllSms(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllSmsResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have any sms numbers currently, create one with: mailscript sms:add`,
              )
              this.exit(0)
            }

            this.log('')
            this.log(chalk.bold('SMS'))
            this.log('')

            cli.table(
              list,
              {
                name: {
                  header: 'Name',
                  get: (row) => row.name,
                },
                id: {
                  header: 'id',
                  get: (row) => row.id,
                },
                number: {
                  header: 'Number',
                  get: (row) => row.number,
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
