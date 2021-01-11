import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import chalk from 'chalk'

export default class SmsDelete extends Command {
  static description = 'delete an sms number'

  static flags = {
    help: flags.help({ char: 'h' }),
    sms: flags.string({
      char: 'a',
      description: 'the SMS',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(SmsDelete)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.delete(client, flags)
  }

  async delete(client: typeof api, { sms }: { sms: string }): Promise<void> {
    const { list }: api.GetAllSmsResponse = await handle(
      client.getAllSms(),
      withStandardErrors({}, this),
    )

    const entry = list.find(({ name }) => name === sms)

    if (!entry) {
      this.log(`${chalk.bold('Error')}: SMS not found ${sms}`)
      this.exit(1)
    }

    return handle(
      client.deleteSms(entry.id),
      withStandardErrors(
        {
          '204': (_response: any) => {
            this.log(`SMS deleted: ${sms}`)
          },
        },
        this,
      ),
    )
  }
}
