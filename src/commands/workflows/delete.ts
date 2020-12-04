import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class WorkflowsDelete extends Command {
  static description = 'delete a workflow'

  static flags = {
    help: flags.help({ char: 'h' }),
    workflow: flags.string({
      char: 'w',
      description: 'id of the workflow to be acted on',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(WorkflowsDelete)

    const client = await setupApiClient()

    return this.delete(client, flags)
  }

  async delete(client: typeof api, flags: { workflow: string }): Promise<void> {
    if (!flags.workflow) {
      this.log(
        'Please provide the workflow id: mailscript workflows delete --workflow <workflow-id>',
      )
      this.exit(1)
    }

    return handle(
      client.deleteWorkflow(flags.workflow),
      withStandardErrors(
        {
          '204': (_response: any) => {
            this.log(`Workflow deleted: ${flags.workflow}`)
          },
        },
        this,
      ),
    )
  }
}
