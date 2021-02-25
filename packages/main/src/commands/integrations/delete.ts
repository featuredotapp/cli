import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class IntegrationsDelete extends Command {
  static description = 'delete an integration'

  static flags = {
    help: flags.help({ char: 'h' }),
    integration: flags.string({
      char: 'i',
      description: 'the integration',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(IntegrationsDelete)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.delete(client, flags)
  }

  async delete(
    client: typeof api,
    flags: { integration: string },
  ): Promise<void> {
    if (!flags.integration) {
      this.log(
        'Please provide the integration: mailscript intergrations:delete --integration <integration-id>',
      )
      this.exit(1)
    }

    return handle(
      client.deleteIntegration(flags.integration),
      withStandardErrors(
        {
          '204': (_response: any) => {
            this.log(`Integration deleted: ${flags.integration}`)
          },
        },
        this,
      ),
    )
  }
}
