import { Command, flags } from '@oclif/command'
import * as api from '../api'
import { handle } from 'oazapfts'
import { assertNever } from '../utils/assertNever'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'

enum Subcommand {
  list = 'list',
  add = 'add',
}

export default class Automations extends Command {
  static description = 'manipulate automations'

  static flags = {
    help: flags.help({ char: 'h' }),
    trigger: flags.string({
      char: 't',
      description: 'id of the trigger accessory',
    }),
    action: flags.string({
      char: 'a',
      description: 'id of the action accessory',
    }),
    forward: flags.string({
      char: 'f',
      description: 'email address for forward action',
    }),
  }

  static args = [
    {
      name: 'subcommand',
      required: true,
      options: Object.keys(Subcommand),
      parse: (input: string) => Subcommand[input as keyof typeof Subcommand],
    },
  ]

  async run() {
    const { args, flags } = this.parse(Automations)

    const subcommand: Subcommand = args.subcommand

    const client = await setupApiClient()

    switch (subcommand) {
      case Subcommand.list:
        return this.list(client)
      case Subcommand.add:
        return this.add(client, flags)
      default:
        assertNever(subcommand)
    }
  }

  async list(client: typeof api): Promise<void> {
    return handle(
      client.getAllAutomations(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllAutomationsResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have an automation currently, create one with: mailscript automation add`,
              )
              this.exit(0)
            }

            this.log('Automations')
            for (const automation of list || []) {
              this.log(`  ${automation.id}`)
            }
          },
        },
        this,
      ),
    )
  }

  async add(client: typeof api, flags: any): Promise<void> {
    if (!flags.trigger) {
      this.log(
        'Please provide a trigger: mailscript automation add --trigger <accessory-id>',
      )
      this.exit(1)
    }

    if (!flags.action) {
      this.log(
        'Please provide an action: mailscript automation add --action <accessory-id>',
      )
      this.exit(1)
    }

    const actionConfig = flags.forward
      ? {
          type: 'FORWARD',
          forwardTo: flags.forward,
        }
      : {}

    const payload: api.AddAutomationRequest = {
      trigger: {
        accessoryId: flags.trigger,
        config: {
          criterias: [],
        },
      },
      actions: [
        {
          accessoryId: flags.action,
          config: actionConfig,
        },
      ],
    }

    return handle(
      client.addAutomation(payload),
      withStandardErrors(
        {
          '201': (response: any) => {
            this.log(`Automation setup: ${response.id}`)
          },
        },
        this,
      ),
    )
  }
}
