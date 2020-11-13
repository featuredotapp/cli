import { Command, flags } from '@oclif/command'
import * as api from '../api'
import { handle } from 'oazapfts'
import { assertNever } from '../utils/assertNever'
import setupApiClient from '../setupApiClient'

enum Subcommand {
  list = 'list',
  add = 'add',
}

export default class Workspace extends Command {
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
    const { args, flags } = this.parse(Workspace)

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

  async list(client: typeof api) {
    return handle(client.getAllWorkspaces(), {
      '200': (result: api.GetAllWorkspacesResponse) => {
        if (!result.list || result.list.length === 0) {
          this.log(
            `you don't have a workspace currently, create one with: mailscript workspace add`,
          )
          this.exit(0)
        }

        this.log('Workspaces')
        for (const workspace of result.list || []) {
          this.log(`  ${workspace.id}`)
        }

        this.log(JSON.stringify(result))
      },
      '403': ({ error }: api.ErrorResponse) => {
        this.log(`Error authenticating: ${error}`)
        this.log(
          'Try setting up your api key in ~/.mailscript by logging in: mailscript login',
        )
        this.exit(1)
      },
      '405': ({ error }: api.ErrorResponse) => {
        this.log(error)
        this.exit(1)
      },
    })
  }

  async add(client: typeof api, flags: any) {
    if (!flags.name) {
      this.log(
        'Please provide a name: mailscript workspace add --name <example>',
      )
      this.exit(1)
    }

    return handle(client.addWorkspace({ workspace: flags.name }), {
      '201': (response: any) => {
        this.log(response)
      },
      '400': ({ error }: api.ErrorResponse) => {
        this.log(`Internal error creating workspace ${flags.name}: ${error}`)
        this.exit(1)
      },
      '403': ({ error }: api.ErrorResponse) => {
        this.log(`Error authenticating: ${error}`)
        this.log(
          'Try setting up your api key in ~/.mailscript by logging in: mailscript login',
        )
        this.exit(1)
      },
      '405': ({ error }: api.ErrorResponse) => {
        this.log(error)
        this.exit(1)
      },
    })
  }
}
