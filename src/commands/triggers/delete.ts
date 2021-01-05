import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class TriggersDelete extends Command {
  static description = 'delete a trigger'

  static flags = {
    help: flags.help({ char: 'h' }),
    trigger: flags.string({
      char: 't',
      description: 'id of the trigger to be acted on',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(TriggersDelete)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.delete(client, flags)
  }

  async delete(client: typeof api, flags: { trigger: string }): Promise<void> {
    if (!flags.trigger) {
      this.log(
        'Please provide the workflow id: mailscript triggers:delete --trigger <trigger-id>',
      )

      this.exit(1)
    }

    return handle(
      client.deleteTrigger(flags.trigger),
      withStandardErrors(
        {
          '204': (_response: any) => {
            this.log(`Trigger deleted: ${flags.trigger}`)
          },
        },
        this,
      ),
    )
  }
}
