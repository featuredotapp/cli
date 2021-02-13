/* eslint-disable complexity */
import { Command, flags } from '@oclif/command'
import chalk from 'chalk'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

type FlagsType = {
  name: string

  from?: string
  sentto?: string
  hasthewords?: string
  domain?: string
  subjectcontains?: string
  hasattachments?: boolean

  property?: string
  equals?: string

  times?: string
  seconds?: string

  and: Array<string>
  or: Array<string>

  [key: string]: any
}

function resolveValue(value: string) {
  if (value.trim() === 'true') {
    return true
  }

  if (value.trim() === 'false') {
    return false
  }

  if (/^\d+$/g.test(value)) {
    return parseInt(value, 10)
  }

  return value
}

export default class TriggersAdd extends Command {
  static description = 'add a trigger'

  static flags = {
    help: flags.help({ char: 'h' }),
    name: flags.string({
      char: 'n',
      description: 'name of the trigger',
      required: true,
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
    property: flags.string({
      description:
        'constrain trigger to emails where the property matches, use with --equals',
    }),
    equals: flags.string({
      description: 'the value used against the property param',
    }),
    exists: flags.boolean({
      description: 'whether the property param exists',
    }),
    and: flags.string({
      multiple: true,
      description: 'combine sub-triggers into a new trigger with "and" logic',
    }),
    or: flags.string({
      multiple: true,
      description: 'combine sub-triggers into a new trigger with "or" logic',
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

    if (flags.times && !flags.seconds) {
      this.log('Flag --seconds required when using --times')
      this.exit(1)
    }

    if (!flags.times && flags.seconds) {
      this.log('Flag --times required when using --seconds')
      this.exit(1)
    }

    if (
      flags.and &&
      (flags.from ||
        flags.sentto ||
        flags.hasthewords ||
        flags.domain ||
        flags.subjectcontains ||
        flags.hasattachments ||
        flags.or)
    ) {
      this.log('Flag --and cannot be used with other criteria')
      this.exit(1)
    }

    if (
      flags.or &&
      (flags.from ||
        flags.sentto ||
        flags.hasthewords ||
        flags.domain ||
        flags.subjectcontains ||
        flags.hasattachments)
    ) {
      this.log('Flag --or cannot be used with other criteria')
      this.exit(1)
    }

    const triggerConfig = await this._resolveTriggerConfig(client, flags)

    return handle(
      client.addTrigger(triggerConfig),
      withStandardErrors(
        {
          '201': () => {
            this.log(`Trigger setup: ${flags.name}`)
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

  private async _resolveTriggerConfig(client: typeof api, flags: FlagsType) {
    if (flags.times && !flags.seconds) {
      this.log('Flag --seconds required when using --times')
      this.exit(1)
    }

    if (!flags.times && flags.seconds) {
      this.log('Flag --times required when using --seconds')
      this.exit(1)
    }

    if (flags.and) {
      if (flags.and.length < 2) {
        this.log('Flag --and requires two or more trigger names')
        this.exit(1)
      }

      const { list: triggers }: api.GetAllTriggersResponse = await handle(
        client.getAllTriggers(),
        withStandardErrors({}, this),
      )

      const triggerIds = flags.and.map((triggerName) => {
        const trigger = triggers.find((t) => t.name === triggerName)

        if (!trigger) {
          this.log(`Trigger not found ${triggerName}`)
          this.exit(1)
        }

        return trigger.id
      })

      return {
        name: flags.name,
        criteria: {
          and: triggerIds,
        },
      }
    }

    if (flags.or) {
      if (flags.or.length < 2) {
        this.log('Flag --or requires two or more trigger names')
        this.exit(1)
      }

      const { list: triggers }: api.GetAllTriggersResponse = await handle(
        client.getAllTriggers(),
        withStandardErrors({}, this),
      )

      const triggerIds = flags.or.map((triggerName) => {
        const trigger = triggers.find((t) => t.name === triggerName)

        if (!trigger) {
          this.log(`Trigger not found ${triggerName}`)
          this.exit(1)
        }

        return trigger.id
      })

      return {
        name: flags.name,
        criteria: {
          or: triggerIds,
        },
      }
    }

    if (flags.equals && !flags.property) {
      this.log('Flag --equals requires to be used with --property')
      this.exit(1)
    }

    if (flags.property) {
      if (!flags.equals && !flags.exists) {
        this.log('Flag --property requires --equals or --exists')
        this.exit(1)
      }

      if (flags.exists) {
        return {
          name: flags.name,
          criteria: {
            [flags.property]: true,
          },
        }
      }

      const resolvedValue = resolveValue(flags.equals!)

      return {
        name: flags.name,
        criteria: {
          [flags.property]: resolvedValue,
        },
      }
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

    const criteria = {
      from: flags.from,
      sentTo: flags.sentto,
      hasTheWords: flags.hasthewords,
      domain: flags.domain,
      subjectContains: flags.subjectcontains,
      hasAttachments: flags.hasattachments,
      firstTimeSender: flags.firsttimesender,
    }

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
