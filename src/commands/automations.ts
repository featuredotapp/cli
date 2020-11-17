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
    send: flags.string({
      description: 'email address for send action',
    }),
    subject: flags.string({
      char: 's',
      description: 'subject of the email',
    }),
    text: flags.string({
      char: 't',
      description: 'text of the email',
    }),
    html: flags.string({
      char: 'h',
      description: 'html of the email',
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
                `you don't have an automation currently, create one with: mailscript automations add`,
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

    // if (!flags.action) {
    //   this.log(
    //     'Please provide an action: mailscript automation add --action <accessory-id>',
    //   )
    //   this.exit(1)
    // }

    const triggerAccessory = await this._lookupAccessory(flags.trigger)
    const actionAccessory = flags.action
      ? await this._lookupAccessory(flags.action)
      : triggerAccessory

    const criterias =
      triggerAccessory.type === 'mailscript-email'
        ? [
            {
              sentTo: triggerAccessory.address,
            },
          ]
        : []

    const actionConfig = this._resolveConfig(flags)

    const payload: api.AddAutomationRequest = {
      trigger: {
        accessoryId: triggerAccessory.id,
        config: {
          criterias,
        },
      },
      actions: [
        {
          accessoryId: actionAccessory.id,
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

  private _resolveConfig(flags: any) {
    if (flags.forward) {
      return {
        type: 'forward',
        forward: flags.forward,
      }
    }

    if (flags.send) {
      if (!flags.subject) {
        this.log('Please provide --subject')
        this.exit(1)
      }

      if (!flags.text && !flags.html) {
        this.log('Please provide either --text or --html')
        this.exit(1)
      }

      return {
        type: 'send',
        to: flags.send,
        subject: flags.subject,
        text: flags.text,
        html: flags.html,
      }
    }

    return {}
  }

  private async _lookupAccessory(nameOrId: string): Promise<api.Accessory> {
    const triggerByNameResponse = await api.getAllAccessories({
      name: nameOrId,
    })

    if (
      triggerByNameResponse.status === 200 &&
      triggerByNameResponse.data.list?.length === 1
    ) {
      return triggerByNameResponse.data.list[0]
    }

    const triggerAccessoryResponse = await api.getAccessory(nameOrId)

    if (triggerAccessoryResponse.status !== 200) {
      this.log(`Error: not an available accessory: ${nameOrId}`)
      this.exit(1)
    }

    const triggerAccessory: api.Accessory = triggerAccessoryResponse.data

    return triggerAccessory
  }
}
