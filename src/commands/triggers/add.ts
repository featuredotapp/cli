/* eslint-disable complexity */
import { Command, flags } from '@oclif/command'
import chalk from 'chalk'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'

type FlagsType = {
  name: string

  from?: string
  sentto?: string
  hasthewords?: string
  domain?: string
  subjectcontains?: string
  hasattachments?: boolean

  times?: string
  seconds?: string

  [key: string]: any
}

export default class TriggersAdd extends Command {
  static description = 'add a trigger'

  static flags = {
    help: flags.help({ char: 'h' }),
    name: flags.string({
      char: 'n',
      description: 'name of the workflow',
      required: true,
    }),
    noninteractive: flags.boolean({
      description: 'do not ask for user input',
      default: false,
    }),
    times: flags.string({
      description: 'number of emails in a period for trigger to activate',
    }),
    seconds: flags.string({
      description: 'period of time to calculate the trigger over',
    }),
    from: flags.string({
      description: 'constrain trigger to emails from the specified address',
    }),
    sentto: flags.string({
      description: 'constrain trigger to emails sent to the specified address',
    }),
    subjectcontains: flags.string({
      description:
        'constrain trigger to emails whose subject contains the specified text',
    }),
    domain: flags.string({
      description:
        'constrain trigger to emails are from an email address with the given domain',
    }),
    hasthewords: flags.string({
      description: 'constrain trigger to emails that have the words specified',
    }),
    hasattachments: flags.boolean({
      description: 'constrain trigger to emails with attachments',
    }),
    firsttimesender: flags.boolean({
      description:
        'constrain trigger to emails that are the first seen from the sending address',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(TriggersAdd)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.add(client, flags)
  }

  async add(client: typeof api, flags: FlagsType): Promise<void> {
    if (!flags.name) {
      this.log('Please provide a name: mailscript triggers:add --name example>')
      this.exit(1)
    }

    const triggerConfig = this._resolveTriggerConfig(flags)

    this.log(JSON.stringify(triggerConfig, undefined, 2))
    this.exit(1)
    // const payload: api.AddWorkflowRequest = {
    //   name: flags.name,
    //   trigger: {
    //     accessoryId: triggerAccessory.id,
    //     config: triggerConfig,
    //   },
    //   actions: [
    //     {
    //       accessoryId: actionAccessory.id,
    //       config: actionConfig,
    //     },
    //   ],
    // }

    // return handle(
    //   client.addWorkflow(payload),
    //   withStandardErrors(
    //     {
    //       '201': () => {
    //         this.log(`Trigger setup: ${flags.name}`)
    //       },
    //       '403': ({ error }: api.ErrorResponse) => {
    //         this.log(chalk.red(`${chalk.bold('Error')}: ${error}`))
    //         this.exit(1)
    //       },
    //     },
    //     this,
    //   ),
    // )
  }

  private _resolveTriggerConfig(flags: FlagsType) {
    if (flags.times && !flags.seconds) {
      this.log('Flag --seconds required when using --times')
      this.exit(1)
    }

    if (!flags.times && flags.seconds) {
      this.log('Flag --times required when using --seconds')
      this.exit(1)
    }

    if (
      !flags.from &&
      !flags.sentto &&
      !flags.hasthewords &&
      !flags.domain &&
      !flags.subjectcontains &&
      !flags.hasattachments &&
      !flags.firsttimesender
    ) {
      this.log(`${chalk.bold(
        'Error',
      )}: Must provide one criteria from following 
  --from
  --sentto
  --hasthewords
  --domain
  --subjectcontains
  --hasattachments
  --firsttimesender`)
      this.exit(1)
    }

    const criteria = [
      {
        from: flags.from,
        sentTo: flags.sentto,
        hasTheWords: flags.hasthewords,
        domain: flags.domain,
        subjectContains: flags.subjectcontains,
        hasAttachments: flags.hasattachments,
        firstTimeSender: flags.firsttimesender,
      },
    ]

    return flags.times && flags.seconds
      ? {
          name: flags.name,
          times: {
            thisManyTimes: parseInt(flags.times, 10),
            thisManySeconds: parseInt(flags.seconds, 10),
          },
          criteria,
        }
      : {
          name: flags.name,
          criteria,
        }
  }
}
