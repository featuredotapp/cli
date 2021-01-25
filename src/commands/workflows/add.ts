/* eslint-disable complexity */
import { Command, flags } from '@oclif/command'
import chalk from 'chalk'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

type FlagsType = {
  name: string
  input: string
  trigger?: string
  action: string

  [key: string]: any
}

export default class WorkflowsAdd extends Command {
  static description = 'add a workflow'

  static flags = {
    help: flags.help({ char: 'h' }),
    workflow: flags.string({
      description: 'id of the workflow to be acted on',
    }),
    name: flags.string({
      char: 'n',
      description: 'name of the workflow',
      required: true,
    }),
    input: flags.string({
      char: 'o',
      description: 'name of the input',
      required: true,
    }),
    trigger: flags.string({
      char: 't',
      description: 'name of the trigger accessory',
      required: false,
    }),
    action: flags.string({
      char: 'a',
      description: 'name of the action accessory',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(WorkflowsAdd)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.add(client, flags)
  }

  async add(client: typeof api, flags: FlagsType): Promise<void> {
    const inputId = await this._resolveInputIdFrom(client, flags.input)
    const triggerId = await this._resolveTriggerIdFrom(client, flags.trigger)
    const actionId = await this._resolveActionIdFrom(client, flags.action)

    const payload: api.AddWorkflowRequest = {
      name: flags.name,
      input: inputId,
      trigger: triggerId || undefined,
      action: actionId,
    }

    return handle(
      client.addWorkflow(payload),
      withStandardErrors(
        {
          '201': () => {
            this.log(`Workflow setup: ${flags.name}`)
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

  private async _resolveInputIdFrom(
    client: typeof api,
    name: string,
  ): Promise<string> {
    const response = await client.getAllInputs({ name })

    if (response.status !== 200) {
      this.debug(response.data.error)
      this.log(`${chalk.bold('Error')}: could not access api for input lookup`)
      this.exit(1)
    }

    const {
      data: { list },
    } = response

    if (list.length !== 1) {
      this.log(`${chalk.bold('Error')}: could not find input ${name}`)
    }

    const { id: inputId } = list[0]

    return inputId
  }

  private async _resolveTriggerIdFrom(
    client: typeof api,
    name: string | undefined,
  ): Promise<string | null> {
    if (!name) {
      return null
    }

    const response = await client.getAllTriggers()

    if (response.status !== 200) {
      this.debug(response.data.error)
      this.log(
        `${chalk.bold('Error')}: could not access api for trigger lookup`,
      )
      this.exit(1)
    }

    const {
      data: { list },
    } = response

    const trigger = list.find((t) => t.name === name)

    if (!trigger) {
      this.log(`${chalk.bold('Error')}: could not find trigger ${name}`)

      this.exit(1)
    }

    return trigger.id
  }

  private async _resolveActionIdFrom(
    client: typeof api,
    name: string,
  ): Promise<string> {
    const response = await client.getAllActions()

    if (response.status !== 200) {
      this.debug(response.data.error)
      this.log(`${chalk.bold('Error')}: could not access api for action lookup`)
      this.exit(1)
    }

    const {
      data: { list },
    } = response

    const trigger = list.find((t) => t.name === name)

    if (!trigger) {
      this.log(`${chalk.bold('Error')}: could not find action ${name}`)

      this.exit(1)
    }

    return trigger.id
  }
}
