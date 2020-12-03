import { Command, flags } from '@oclif/command'
import * as api from '../api'
import { handle } from 'oazapfts'
import { assertNever } from '../utils/assertNever'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'

enum Subcommand {
  list = 'list',
  add = 'add',
  delete = 'delete',
}

export default class Addresses extends Command {
  static description = 'manipulate addresses'

  static flags = {
    help: flags.help({ char: 'h' }),
    address: flags.string({ char: 'a', description: 'the address' }),
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
    const { args, flags } = this.parse(Addresses)

    const subcommand: Subcommand = args.subcommand

    const client = await setupApiClient()

    switch (subcommand) {
      case Subcommand.list:
        return this.list(client)
      case Subcommand.add:
        return this.add(client, flags)
      case Subcommand.delete:
        return this.delete(client, flags)
      default:
        assertNever(subcommand)
    }
  }

  async list(client: typeof api): Promise<void> {
    return handle(
      client.getAllAddresses(),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllAddressesResponse) => {
            if (!list || list.length === 0) {
              this.log(
                `you don't have any addresses currently, create one with: mailscript addresses add`,
              )
              this.exit(0)
            }

            this.log('Addresses')
            for (const address of list || []) {
              this.log(`  ${address.id}`)
            }
          },
        },
        this,
      ),
    )
  }

  async add(client: typeof api, flags: any): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide an address to add: mailscript address add --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    await handle(
      client.addAddress({ address: flags.address }),
      withStandardErrors({}, this),
    )

    const { id: key } = await handle(
      client.addKey(flags.address, {
        name: 'owner',
        read: true,
        write: true,
      }),
      withStandardErrors({}, this),
    )

    await handle(
      client.addAccessory({
        name: flags.address,
        type: 'mailscript-email',
        address: flags.address,
        key,
      }),
      withStandardErrors({}, this),
    )

    this.log(`Address added: ${flags.address}`)
  }

  async delete(client: typeof api, flags: any): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide the address: mailscript addresses delete --address <smith@example.com>',
      )
      this.exit(1)
    }

    return handle(
      client.deleteAddress(flags.address),
      withStandardErrors(
        {
          '204': (_response: any) => {
            this.log(`Address deleted: ${flags.address}`)
          },
        },
        this,
      ),
    )
  }
}
