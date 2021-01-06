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
      trigger: triggerId,
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
      this.log(`${chalk.bold('Error')}: could not access api for output lookup`)
      this.exit(1)
    }

    const {
      data: { list },
    } = response

    if (list.length !== 1) {
      this.log(`${chalk.bold('Error')}: could find input ${name}`)
    }

    const { id: inputId } = list[0]

    return inputId
  }

  private async _resolveTriggerIdFrom(
    client: typeof api,
    name: string | undefined,
  ): Promise<string> {
    if (!name) {
      this.log(`No trigger given - tbd`)
      this.exit(1)
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

  // private _resolveTriggerConfig(
  //   flags: FlagsType,
  //   triggerAccessory: api.Accessory,
  // ) {
  //   if (flags.times && !flags.seconds) {
  //     this.log('Flag --seconds required when using --times')
  //     this.exit(1)
  //   }

  //   if (!flags.times && flags.seconds) {
  //     this.log('Flag --times required when using --seconds')
  //     this.exit(1)
  //   }

  //   let criterias: Array<any> = []
  //   if (
  //     flags.from ||
  //     flags.sentto ||
  //     flags.hasthewords ||
  //     flags.domain ||
  //     flags.subjectcontains ||
  //     flags.hasattachments ||
  //     flags.firsttimesender
  //   ) {
  //     criterias = [
  //       {
  //         from: flags.from,
  //         sentTo: flags.sentto,
  //         hasTheWords: flags.hasthewords,
  //         domain: flags.domain,
  //         subjectContains: flags.subjectcontains,
  //         hasAttachments: flags.hasattachments,
  //         firstTimeSender: flags.firsttimesender,
  //       },
  //     ]
  //   } else if (triggerAccessory.type === 'mailscript-email') {
  //     criterias = []
  //   }

  //   return flags.times && flags.seconds
  //     ? {
  //         times: {
  //           thisManyTimes: parseInt(flags.times, 10),
  //           thisManySeconds: parseInt(flags.seconds, 10),
  //         },
  //         criterias,
  //       }
  //     : {
  //         criterias,
  //       }
  // }

  // private _resolveActionConfig(
  //   flags: FlagsType,
  //   actionAccessory: api.Accessory,
  // ) {
  //   if (actionAccessory && actionAccessory.type === 'sms') {
  //     if (!flags.text) {
  //       this.log('Please provide --text')
  //       this.exit(1)
  //     }

  //     return {
  //       type: 'sms',
  //       text: flags.text,
  //     }
  //   }

  //   if (actionAccessory && actionAccessory.type === 'daemon') {
  //     const body = flags.body
  //       ? fs.readFileSync(flags.body).toString()
  //       : undefined

  //     return {
  //       type: 'daemon',
  //       body,
  //     }
  //   }

  //   if (flags.forward) {
  //     return {
  //       type: 'forward',
  //       forward: flags.forward,
  //     }
  //   }

  //   if (flags.send) {
  //     if (!flags.subject) {
  //       this.log('Please provide --subject')
  //       this.exit(1)
  //     }

  //     if (!flags.text && !flags.html) {
  //       this.log('Please provide either --text or --html')
  //       this.exit(1)
  //     }

  //     return {
  //       type: 'send',
  //       to: flags.send,
  //       subject: flags.subject,
  //       text: flags.text,
  //       html: flags.html,
  //     }
  //   }

  //   if (flags.reply) {
  //     if (!flags.text && !flags.html) {
  //       this.log('Please provide either --text or --html')
  //       this.exit(1)
  //     }

  //     return {
  //       type: 'reply',
  //       text: flags.text,
  //       html: flags.html,
  //     }
  //   }

  //   if (flags.replyall) {
  //     if (!flags.text && !flags.html) {
  //       this.log('Please provide either --text or --html')
  //       this.exit(1)
  //     }

  //     return {
  //       type: 'replyAll',
  //       text: flags.text,
  //       html: flags.html,
  //     }
  //   }

  //   if (flags.alias) {
  //     return {
  //       type: 'alias',
  //       alias: flags.alias,
  //     }
  //   }

  //   if (flags.webhook) {
  //     const method = flags.method ? flags.method : 'POST'

  //     const body = flags.body ? fs.readFileSync(flags.body).toString() : ''

  //     const headers = flags.headers
  //       ? Object.assign(
  //           {
  //             'Content-Type': 'application/json',
  //           },
  //           JSON.parse(fs.readFileSync(flags.headers).toString()),
  //         )
  //       : {
  //           'Content-Type': 'application/json',
  //         }

  //     return {
  //       type: 'webhook',
  //       url: flags.webhook,
  //       opts: {
  //         headers: headers,
  //         method,
  //       },
  //       body,
  //     }
  //   }

  //   return {}
  // }

  // private _resolveActionAccessory(
  //   flags: FlagsType,
  //   accessories: Array<api.Accessory>,
  // ) {
  //   if (flags.webhook) {
  //     return this._findAccessoryBy(accessories, 'webhook')
  //   }

  //   if (flags.action) {
  //     return this._findAccessoryBy(accessories, flags.action)
  //   }

  //   return this._findAccessoryBy(accessories, flags.trigger)
  // }

  // private async _getAllAccessories(): Promise<Array<api.Accessory>> {
  //   const response = await api.getAllAccessories()

  //   if (response.status !== 200) {
  //     this.log(`Error: unable to read accessories - ${response.data.error}`)
  //     this.exit(1)
  //   }

  //   return response.data.list || []
  // }

  // private async _optionallyVerifyAlias(
  //   client: typeof api,
  //   flags: FlagsType,
  //   {
  //     type,
  //     alias,
  //   }: {
  //     type?: string
  //     alias?: string
  //   },
  // ) {
  //   if (type !== 'alias') {
  //     return
  //   }

  //   if (!alias) {
  //     throw new Error('Alias must be provided')
  //   }

  //   const { email: userEmail } = await handle(
  //     client.getAuthenticatedUser(),
  //     withStandardErrors({}, this),
  //   )

  //   // User's verified email address
  //   if (userEmail === alias) {
  //     return
  //   }

  //   const {
  //     list: userAccessories,
  //   }: api.GetAllAccessoriesResponse = await handle(
  //     client.getAllAccessories(),
  //     withStandardErrors({}, this),
  //   )

  //   const baseAlias = resolveBaseAddress(alias)

  //   const existingAccessory = userAccessories.find(
  //     ({ name, type }) => type === 'mailscript-email' && name === baseAlias,
  //   )

  //   if (existingAccessory) {
  //     this.debug(
  //       `Checking existing mailscript address: ${existingAccessory.address}`,
  //     )

  //     if (existingAccessory.address) {
  //       const { write } = await handle(
  //         client.getKey(existingAccessory.address, existingAccessory.key),
  //         withStandardErrors({}, this),
  //       )

  //       if (write) {
  //         return
  //       }
  //     }
  //   }

  //   const { list: verifications } = await handle(
  //     client.getAllVerifications(),
  //     withStandardErrors({}, this),
  //   )

  //   const emailVerification = verifications.find(
  //     (v: api.VerificationEmail) => v.email === alias,
  //   )

  //   if (emailVerification && emailVerification.verified) {
  //     return
  //   }

  //   if (flags.noninteractive) {
  //     this.log(
  //       chalk.red(
  //         `${chalk.bold('Error')}: the email address ${chalk.bold(
  //           alias,
  //         )} must be verified before being included in an ${chalk.bold(
  //           'alias',
  //         )} workflow`,
  //       ),
  //     )
  //     this.exit(1)
  //   }

  //   this.log('')
  //   this.log(
  //     `The email address ${chalk.bold(
  //       alias,
  //     )} must be verified before being included in an ${chalk.bold(
  //       'alias',
  //     )} workflow.`,
  //   )

  //   this.log('')
  //   const verifyEmailAddress = await cli.confirm(
  //     `Do you want to send a verification email to ${chalk.bold(
  //       alias,
  //     )}? ${chalk.cyan('(y/n)')}`,
  //   )

  //   if (!verifyEmailAddress) {
  //     this.log(chalk.red('Workflow not added'))
  //     this.exit(1)
  //   }

  //   const verified = await verifyEmailFlow(client, alias, this)

  //   if (!verified) {
  //     this.exit(1)
  //   }

  //   this.log('')
  // }

  // private _findAccessoryBy(
  //   accessories: Array<api.Accessory>,
  //   nameOrId: string,
  // ): api.Accessory {
  //   const accessory = accessories.find(
  //     (a) => a.id === nameOrId || a.name === nameOrId,
  //   )

  //   if (!accessory) {
  //     this.log(`Error: not an available accessory: ${nameOrId}`)
  //     this.exit(1)
  //   }

  //   return accessory
  // }
}
