import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class SmsAdd extends Command {
  static description = 'add an SMS number'

  static flags = {
    help: flags.help({ char: 'h' }),
    name: flags.string({
      char: 'n',
      description: 'the name for referring to the SMS number',
      required: true,
    }),
    number: flags.string({
      char: 'a',
      description: 'the SMS number',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(SmsAdd)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.add(client, flags)
  }

  async add(
    client: typeof api,
    { name, number }: { name: string; number: string },
  ): Promise<void> {
    return handle(
      client.addSms({ name, number }),
      withStandardErrors(
        {
          201: () => {
            this.log(`SMS setup: ${name}`)
          },
        },
        this,
      ),
    )
  }
}
