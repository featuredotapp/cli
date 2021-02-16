import { Command, flags } from '@oclif/command'
import chalk from 'chalk'
import { handle } from 'oazapfts'

import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

type FlagsType = {
  name: string

  [key: string]: any
}

export default class ActionsCombine extends Command {
  static description = 'create an action by combining other actions'

  static flags = {
    help: flags.help({ char: 'h' }),
    name: flags.string({
      required: true,
      description: 'the name of the new actions',
    }),
    action: flags.string({
      required: true,
      multiple: true,
      description: 'Action to combine',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(ActionsCombine)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.combine(client, flags)
  }

  async combine(client: typeof api, flags: FlagsType): Promise<void> {
    if (flags.action.length < 2) {
      this.log('At least two actions must be combined')
      this.exit(1)
    }

    const { list }: api.GetAllActionsResponse = await handle(
      client.getAllActions(),
      withStandardErrors({}, this),
    )

    const actionsForCombining = flags.action
      .map((a: string) => {
        const action = list.find(({ name }) => name === a)

        if (!action) {
          this.log(`Could not find action ${a}`)
          this.exit(1)
        }

        return action
      })
      .filter((a: any) => Boolean(a))
      .map((a: any) => a.id)

    return handle(
      client.addAction({
        name: flags.name,
        list: actionsForCombining,
      }),
      withStandardErrors(
        {
          '201': () => {
            this.log(`Action setup: ${flags.name}`)
          },
          '403': ({ error }: api.ErrorResponse) => {
            this.log(chalk.red(`${chalk.bold('Error')}: ${error}`))
            this.exit(1)
          },
        },
        this,
      ),
    )
  }
}
