import { Command, flags } from '@oclif/command'
import * as api from '../api'
import { handle } from 'oazapfts'
import { assertNever } from '../utils/assertNever'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'
import { cli } from 'cli-ux'

enum Subcommand {
  list = 'list',
  add = 'add',
}

export default class Keys extends Command {
  static description = 'Manipulate address keys'

  static flags = {
    help: flags.help({ char: 'h' }),
    address: flags.string({
      description: 'the email address to look for keys against',
    }),
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
    const { args, flags } = this.parse(Keys)

    const subcommand: Subcommand = args.subcommand

    const client = await setupApiClient()

    switch (subcommand) {
      case Subcommand.list:
        return this.list(client, flags)
      case Subcommand.add:
        return this.add()
      default:
        assertNever(subcommand)
    }
  }

  async list(client: typeof api, flags: any): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide an address: mailscript keys list --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    return handle(
      client.getAllKeys(flags.address),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllKeysResponse) => {
            if (!list || list.length === 0) {
              this.log(`you don't have any keys against that address`)
              this.exit(0)
            }

            this.log('')
            this.log(`Keys for ${flags.address}`)
            this.log('')

            cli.table(
              list,
              {
                id: {
                  header: 'Id',
                  get: (row) => row.id,
                },
                read: {
                  header: 'Read',
                  get: (row) => row.read,
                },
                write: {
                  header: 'Write',
                  get: (row) => row.write,
                },
              },
              { printLine: this.log },
            )
          },
        },
        this,
      ),
    )
  }

  async add(): Promise<void> {
    this.log('TBD')
  }
}
