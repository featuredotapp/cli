/* eslint-disable complexity */
import { Command, flags } from '@oclif/command'
import chalk from 'chalk'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

type FlagsType = {
  type?: string

  [key: string]: any
}

export default class WorkflowsSet extends Command {
  static description = 'set a property on a workflow'

  static flags = {
    help: flags.help({ char: 'h' }),
    type: flags.string({
      char: 't',
      description: 'type of the value',
      required: false,
    }),
  }

  static args = [
    {
      name: 'id',
      required: true,
      description: 'id of the workflow to be acted on',
    },
    {
      name: 'key',
      required: true,
      description: 'key of the property',
    },
    {
      name: 'value',
      required: true,
      description: 'value of the property',
    },
  ]

  async run() {
    const { flags, args } = this.parse(WorkflowsSet)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.set(client, flags, args)
  }

  async set(client: typeof api, flags: FlagsType, args: any): Promise<void> {
    let value
    switch (flags.type) {
      case 'boolean': {
        value = Boolean(args.value)
        break
      }
      case 'number': {
        value = Number(args.value)
        break
      }
      case 'string': {
        value = args.value
        break
      }
      default: {
        value = args.value
        break
      }
    }
    const pairs: api.KeyValuePair = {
      key: args.key,
      value,
    }
    const payload: api.SetWorkflowRequest = {
      id: args.id,
      pairs: [pairs],
    }

    return handle(
      client.setWorkflow(payload),
      withStandardErrors(
        {
          '201': () => {
            this.log(`Workflow property has been set`)
          },
          '403': ({ error }: api.ErrorResponse) => {
            this.log(chalk.red(`${chalk.bold('Error')}: ${error}`))
            this.exit(1)
          },
          '405': ({ error }: api.ErrorResponse) => {
            this.log(chalk.red(`${chalk.bold('Error')}: ${error}`))
            this.exit(1)
          },
        },
        this,
      ),
    )
  }
}
