import { Command, flags } from '@oclif/command'
import * as fs from 'fs'
import { handle } from 'oazapfts'
import * as api from '../api'
import { assertNever } from '../utils/assertNever'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'

enum Subcommand {
  list = 'list',
  add = 'add',
}

const automationTypeFlags = [
  'send',
  'alias',
  'forward',
  'reply',
  'replyall',
  'webhook',
]

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
    reply: flags.boolean({
      char: 'r',
      description: 'email address for reply action',
    }),
    replyall: flags.boolean({
      description: 'email address for reply all action',
    }),
    send: flags.string({
      description: 'email address for send action',
    }),
    alias: flags.string({
      description: 'email address for alias action',
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
    webhook: flags.string({
      char: 'w',
      description: 'url of the webhook to call',
    }),
    method: flags.enum({
      options: ['PUT', 'POST', 'GET'],
      default: 'POST',
      description: 'HTTP method to use in webhook',
    }),
    headers: flags.string({
      description: 'file to take webhook headers from',
    }),
    body: flags.string({
      description: 'file to take webhook body from',
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

    if (
      automationTypeFlags.map((atf) => flags[atf]).filter((f) => Boolean(f))
        .length !== 1
    ) {
      this.log(
        'Please provide one type flag either: \n  --' +
          automationTypeFlags.join('\n  --'),
      )
      this.exit(1)
    }

    // if (!flags.action) {
    //   this.log(
    //     'Please provide an action: mailscript automation add --action <accessory-id>',
    //   )
    //   this.exit(1)
    // }

    const accessories = await this._getAllAccessories()

    const triggerAccessory = this._findAccessoryBy(accessories, flags.trigger)
    const actionAccessory = this._resolveActionAccessory(flags, accessories)

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

    if (flags.reply) {
      if (!flags.text && !flags.html) {
        this.log('Please provide either --text or --html')
        this.exit(1)
      }

      return {
        type: 'reply',
        text: flags.text,
        html: flags.html,
      }
    }

    if (flags.replyall) {
      if (!flags.text && !flags.html) {
        this.log('Please provide either --text or --html')
        this.exit(1)
      }

      return {
        type: 'replyAll',
        text: flags.text,
        html: flags.html,
      }
    }

    if (flags.alias) {
      return {
        type: 'alias',
        alias: flags.alias,
      }
    }

    if (flags.webhook) {
      const method = flags.method ? flags.method : 'POST'

      const body = flags.body ? fs.readFileSync(flags.body).toString() : ''

      const headers = flags.headers
        ? Object.assign(
            {
              'Content-Type': 'application/json',
            },
            JSON.parse(fs.readFileSync(flags.headers).toString()),
          )
        : {
            'Content-Type': 'application/json',
          }

      return {
        type: 'webhook',
        url: flags.webhook,
        opts: {
          headers: headers,
          method,
        },
        body,
      }
    }

    return {}
  }

  private _resolveActionAccessory(
    flags: any,
    accessories: Array<api.Accessory>,
  ) {
    if (flags.webhook) {
      return this._findAccessoryBy(accessories, 'webhook')
    }

    if (flags.action) {
      return this._findAccessoryBy(accessories, flags.action)
    }

    return this._findAccessoryBy(accessories, flags.trigger)
  }

  private async _getAllAccessories(): Promise<Array<api.Accessory>> {
    const response = await api.getAllAccessories()

    if (response.status !== 200) {
      this.log(`Error: unable to read accessories - ${response.data.error}`)
      this.exit(1)
    }

    return response.data.list || []
  }

  private _findAccessoryBy(
    accessories: Array<api.Accessory>,
    nameOrId: string,
  ): api.Accessory {
    const accessory = accessories.find(
      (a) => a.id === nameOrId || a.name === nameOrId,
    )

    if (!accessory) {
      this.log(`Error: not an available accessory: ${nameOrId}`)
      this.exit(1)
    }

    return accessory
  }
}
