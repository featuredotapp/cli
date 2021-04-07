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

export default class WorkflowsActive extends Command {
  static description = 'toggle a workflow on or off'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [
    {
      name: 'id',
      required: true,
      description: 'id of the workflow to be acted on',
    },
    {
      name: 'value',
      required: false,
      description: '"on" or "off"',
    },
  ]

  async run() {
    const { flags, args } = this.parse(WorkflowsActive)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.set(client, flags, args)
  }

  async set(client: typeof api, flags: FlagsType, args: any): Promise<void> {
    if (!args.value) {
      const workflow = (
        await handle(
          client.getAllWorkflows(),
          withStandardErrors(
            { '200': ({ list }: api.GetAllWorkflowsResponse) => list },
            this,
          ),
        )
      ).find(({ id }: any) => id === args.id)
      if (workflow.active === true) {
        this.log('This workflow is active')
      } else if (workflow.active === false) {
        this.log('This workflow is not active')
      } else {
        // default to active if no status is set.
        this.log('This workflow is active')
      }

      return
    }
    let value
    switch (args.value) {
      case 'on': {
        value = true
        break
      }
      case 'off': {
        value = false
        break
      }
      default: {
        this.log(`Invalid input ${args.value}`)
      }
    }
    const pairs: api.KeyValuePair = {
      key: 'active',
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
            this.log(`Workflow property has been set to ${args.value}`)
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
