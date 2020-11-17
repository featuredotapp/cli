import { Command, flags } from '@oclif/command'
import * as api from '../api'
import { handle } from 'oazapfts'
import { assertNever } from '../utils/assertNever'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'

enum Subcommand {
  list = 'list',
}

export default class Accessories extends Command {
  static description = 'manipulate accessories'

  static flags = {
    help: flags.help({ char: 'h' }),
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
    const { args } = this.parse(Accessories)

    const subcommand: Subcommand = args.subcommand

    const client = await setupApiClient()

    switch (subcommand) {
      case Subcommand.list:
        return this.list(client)
      // case Subcommand.add:
      //   return this.add(client, flags)
      default:
        assertNever(subcommand)
    }
  }

  async list(client: typeof api): Promise<void> {
    return handle(
      client.getAllAccessories(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllAccessoriesResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have a accessories currently, create an address to add one: mailscript addresses add --address example@workspace.mailscript.com`,
              )
              this.exit(0)
            }

            this.log('Accessories')
            for (const accessory of list || []) {
              this.log(`  ${accessory.name}`)
            }
          },
        },
        this,
      ),
    )
  }
}
