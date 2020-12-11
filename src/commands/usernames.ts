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

export default class Usernames extends Command {
  static description = 'manipulate usernames'

  static flags = {
    help: flags.help({ char: 'h' }),
    username: flags.string({ char: 'n', description: 'the username to claim' }),
  }

  static args = [
    {
      name: 'subcommand',
      required: true,
      default: Subcommand.list,
      options: Object.keys(Subcommand),
      parse: (input: string) => Subcommand[input as keyof typeof Subcommand],
    },
  ]

  async run() {
    const { args, flags } = this.parse(Usernames)

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

  async list(client: typeof api): void {
    await handle(
      client.getAllWorkspaces(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllWorkspacesResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have a username currently, create one with: mailscript usernames add`,
              )
              this.exit(0)
            }

            this.log('Usernames')

            for (const workspace of list || []) {
              this.log(`  ${workspace.id}`)
            }
          },
        },
        this,
      ),
    )
  }

  async add(client: typeof api, flags: any): void {
    if (!flags.username) {
      this.log(
        'Please provide a username: mailscript usernames add --username <example>',
      )
      this.exit(1)
    }

    await handle(
      client.addWorkspace({ workspace: flags.username }),
      withStandardErrors(
        {
          '201': (response: any) => {
            this.log(`Username '${response.id}' added`)
          },
        },
        this,
      ),
    )
  }
}
