import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

const accessoryTypeFlags = ['sms']

export default class AccessoriesAdd extends Command {
  static description = 'add an accessory'

  static flags = {
    help: flags.help({ char: 'h' }),
    name: flags.string({
      char: 'n',
      description: 'the name of the accessory',
      required: true,
    }),
    sms: flags.string({
      description: 'the telephone number to send the sms too',
      required: true,
    }),
  }

  static args = []

  async run(): void {
    const { flags } = this.parse(AccessoriesAdd)

    const client = await setupApiClient()

    await this.add(client, flags)
  }

  async add(client: typeof api, flags: { name: string; sms: string }): void {
    if (!flags.name) {
      this.log('Please provide a name for the accessory: \n  --name')
      this.exit(1)
    }

    if (flags.sms) {
      const payload: api.AddSmsAccessoryRequest = {
        name: flags.name,
        type: 'sms',
        sms: flags.sms,
      }

      await handle(
        client.addAccessory(payload),
        withStandardErrors(
          {
            '201': (_response: any) => {
              this.log(`Accessory setup: ${flags.name}`)
            },
          },
          this,
        ),
      )
    }

    this.log(
      'Please provide one type flag either: \n  --' +
        accessoryTypeFlags.join('\n  --'),
    )
    this.exit(1)
  }
}
