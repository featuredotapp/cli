import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class ActionsDelete extends Command {
  static description = 'delete an action'

  static flags = {
    help: flags.help({ char: 'h' }),
    action: flags.string({
      char: 'a',
      description: 'id of the action to be acted deleted',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(ActionsDelete)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.delete(client, flags)
  }

  async delete(
    client: typeof api,
    { action }: { action: string },
  ): Promise<void> {
    if (!action) {
      this.log(
        'Please provide the workflow id: mailscript workflows delete --workflow <workflow-id>',
      )
      this.exit(1)
    }

    return handle(
      client.deleteAction(action),
      withStandardErrors(
        {
          '204': (_response: any) => {
            this.log(`Action deleted: ${action}`)
          },
        },
        this,
      ),
    )
  }
}
