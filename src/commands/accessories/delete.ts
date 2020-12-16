import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class AccessoriesDelete extends Command {
  static description = 'delete an accessory'

  static flags = {
    help: flags.help({ char: 'h' }),
    accessory: flags.string({
      char: 'a',
      description: 'id of the accessory to act upon',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(AccessoriesDelete)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.delete(client, flags)
  }

  async delete(
    client: typeof api,
    flags: { accessory: string },
  ): Promise<void> {
    if (!flags.accessory) {
      this.log(
        'Please provide the accessory id: mailscript accessories delete --accessory <accessory-id>',
      )
      this.exit(1)
    }

    return handle(
      client.deleteAccessory(flags.accessory),
      withStandardErrors(
        {
          '204': (_response: any) => {
            this.log(`Accessory deleted: ${flags.accessory}`)
          },
        },
        this,
      ),
    )
  }
}
