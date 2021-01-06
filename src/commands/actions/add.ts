/* eslint-disable complexity */
import { Command, flags } from '@oclif/command'
import chalk from 'chalk'
import { cli } from 'cli-ux'
import * as fs from 'fs'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import resolveBaseAddress from '../../utils/resolveBaseAddress'
import verifyEmailFlow from '../../utils/verifyEmailFlow'

type FlagsType = {
  name: string

  forward?: string
  send?: string
  reply?: boolean
  replyall?: boolean
  alias?: string
  webhook?: string

  text?: string
  subject?: string
  html?: string
  method?: string
  body?: string
  headers?: string

  [key: string]: any
}

export default class ActionsAdd extends Command {
  static description = 'add an action'

  static flags = {
    help: flags.help({ char: 'h' }),
    noninteractive: flags.boolean({
      description: 'do not ask for user input',
      default: false,
    }),
    name: flags.string({
      char: 'n',
      description: 'name of the action',
      required: true,
    }),
    output: flags.string({
      char: 'o',
      description: 'name of the output to use',
      required: true,
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
      description: 'text of the email',
    }),
    html: flags.string({
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

  static args = []

  async run() {
    const { flags } = this.parse(ActionsAdd)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.add(client, flags)
  }

  async add(client: typeof api, flags: FlagsType): Promise<void> {
    if (!flags.name) {
      this.log(
        'Please provide a name: mailscript actions:add --name <personal-forward>',
      )
      this.exit(1)
    }

    if (!flags.output) {
      this.log(
        'Please provide an output: mailscript actions:add --output <output-name>',
      )

      this.exit(1)
    }

    const output = await this._findOutput(flags)

    if (!output) {
      this.log(`${chalk.bold('Error')}: Unknown output ${flags.output}`)
      this.exit(1)
    }

    // if (
    //   actionAccessory.type !== 'sms' &&
    //   actionAccessory.type !== 'daemon' &&
    //   actionTypeFlags.map((atf) => flags[atf]).filter((f) => Boolean(f))
    //     .length !== 1
    // ) {
    //   this.log(
    //     'Please provide one type flag either: \n  --' +
    //       actionTypeFlags.join('\n  --'),
    //   )
    //   this.exit(1)
    // }

    const actionConfig: any = this._resolveActionConfig(flags, output)

    await this._optionallyVerifyAlias(client, flags, actionConfig)

    const payload: api.AddActionRequest = {
      name: flags.name,
      output: output.id,
      config: actionConfig,
    }

    return handle(
      client.addAction(payload),
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

  private _resolveActionConfig(
    flags: FlagsType,
    actionAccessory: api.MailscriptEmailOutput,
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (actionAccessory.type === 'sms') {
      if (!flags.text) {
        this.log('Please provide --text')
        this.exit(1)
      }

      return {
        type: 'sms',
        text: flags.text,
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (actionAccessory.type === 'daemon') {
      const body = flags.body
        ? fs.readFileSync(flags.body).toString()
        : undefined

      return {
        type: 'daemon',
        body,
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (actionAccessory.type === 'webhook') {
      if (!flags.webhook) {
        this.log('Please provide --webhook')
        this.exit(1)
      }

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

    if (actionAccessory.type && 'mailscript-email') {
      if (flags.forward) {
        return {
          type: 'forward',
          forward: flags.forward,
        } as api.AddActionConfigForward
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
          send: flags.send,
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
    }

    this.log(`${chalk.bold('Error')}: please provide either:
  --send
  --forward
  --reply
  --replyall
  --alias`)
    this.exit(1)
  }

  private async _findOutput(
    flags: FlagsType,
  ): Promise<api.MailscriptEmailOutput | null> {
    const response = await api.getAllOutputs({ name: flags.output })

    if (response.status !== 200) {
      this.log(`Error: unable to read outputs - ${response.data.error}`)
      this.exit(1)
    }

    if (response.data.list.length !== 1) {
      return null
    }

    return response.data.list[0]
  }

  private async _optionallyVerifyAlias(
    client: typeof api,
    flags: FlagsType,
    {
      type,
      alias,
    }: {
      type?: string
      alias?: string
    },
  ) {
    if (type !== 'alias') {
      return
    }

    if (!alias) {
      throw new Error('Alias must be provided')
    }

    const { email: userEmail } = await handle(
      client.getAuthenticatedUser(),
      withStandardErrors({}, this),
    )

    // User's verified email address
    if (userEmail === alias) {
      return
    }

    const {
      list: userAccessories,
    }: api.GetAllAccessoriesResponse = await handle(
      client.getAllAccessories(),
      withStandardErrors({}, this),
    )

    const baseAlias = resolveBaseAddress(alias)

    const existingAccessory = userAccessories.find(
      ({ name, type }) => type === 'mailscript-email' && name === baseAlias,
    )

    if (existingAccessory) {
      this.debug(
        `Checking existing mailscript address: ${existingAccessory.address}`,
      )

      if (existingAccessory.address) {
        const { write } = await handle(
          client.getKey(existingAccessory.address, existingAccessory.key),
          withStandardErrors({}, this),
        )

        if (write) {
          return
        }
      }
    }

    const { list: verifications } = await handle(
      client.getAllVerifications(),
      withStandardErrors({}, this),
    )

    const emailVerification = verifications.find(
      (v: api.VerificationEmail) => v.email === alias,
    )

    if (emailVerification && emailVerification.verified) {
      return
    }

    if (flags.noninteractive) {
      this.log(
        chalk.red(
          `${chalk.bold('Error')}: the email address ${chalk.bold(
            alias,
          )} must be verified before being included in an ${chalk.bold(
            'alias',
          )} workflow`,
        ),
      )
      this.exit(1)
    }

    this.log('')
    this.log(
      `The email address ${chalk.bold(
        alias,
      )} must be verified before being included in an ${chalk.bold(
        'alias',
      )} workflow.`,
    )

    this.log('')
    const verifyEmailAddress = await cli.confirm(
      `Do you want to send a verification email to ${chalk.bold(
        alias,
      )}? ${chalk.cyan('(y/n)')}`,
    )

    if (!verifyEmailAddress) {
      this.log(chalk.red('Workflow not added'))
      this.exit(1)
    }

    const verified = await verifyEmailFlow(client, alias, this)

    if (!verified) {
      this.exit(1)
    }

    this.log('')
  }
}
