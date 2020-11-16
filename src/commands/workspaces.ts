import { Command, flags } from '@oclif/command'
import * as api from '../api'
import { handle } from 'oazapfts'
import { assertNever } from '../utils/assertNever'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'

enum Subcommand {
  list = 'list',
  add = 'add',
}

export default class Workspaces extends Command {
  static description = 'manipulate workspaces'

  static flags = {
    help: flags.help({ char: 'h' }),
    name: flags.string({ char: 'n', description: 'name of the workspace' }),
  }

  static args = [
    {
      name: 'subcommand',
      required: true,
      options: Object.keys(Subcommand),
      parse: (input: string) => Subcommand[input as keyof typeof Subcommand],
    },
  ]

  async run() {
    const { args, flags } = this.parse(Workspaces)

    const subcommand: Subcommand = args.subcommand

    const client = await setupApiClient()

    switch (subcommand) {
      case Subcommand.list:
        return this.list(client)
      case Subcommand.add:
        return this.add(client, flags)
      default:
        assertNever(subcommand)
    }
  }

  async list(client: typeof api): Promise<void> {
    return handle(
      client.getAllWorkspaces(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllWorkspacesResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have a workspace currently, create one with: mailscript workspace add`,
              )
              this.exit(0)
            }

            this.log('Workspaces')
            for (const workspace of list || []) {
              this.log(`  ${workspace.id}`)
            }
          },
        },
        this,
      ),
    )
  }

  async add(client: typeof api, flags: any): Promise<void> {
    if (!flags.name) {
      this.log(
        'Please provide a name: mailscript workspace add --name <example>',
      )
      this.exit(1)
    }

    return handle(
      client.addWorkspace({ workspace: flags.name }),
      withStandardErrors(
        {
          '201': (response: any) => {
            this.log(`Workspace '${response.id}' added`)
          },
        },
        this,
      ),
    )
  }
}
