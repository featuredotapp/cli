import { Command, flags } from '@oclif/command'
import * as api from '../api'
import { handle } from 'oazapfts'
import { assertNever } from '../utils/assertNever'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'
import { cli } from 'cli-ux'

type FlagsType = {
  help: void
  name: string | undefined
  sms: string | undefined
  accessory: string | undefined
}

enum Subcommand {
  list = 'list',
  add = 'add',
  delete = 'delete',
}

const accessoryTypeFlags = ['sms']

export default class Accessories extends Command {
  static description = 'manipulate accessories'

  static flags = {
    help: flags.help({ char: 'h' }),
    accessory: flags.string({
      char: 'a',
      description: 'id of the accessory to act upon',
    }),
    name: flags.string({
      char: 'n',
      description: 'the name of the automation',
    }),
    sms: flags.string({
      description: 'the telephone number to send the sms too',
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
    const { args, flags } = this.parse(Accessories)

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

            this.log('')
            this.log('Accessories')
            this.log('')

            cli.table(
              list,
              {
                id: {
                  header: 'Id',
                  get: (row) => row.id,
                },
                name: {
                  header: 'Name',
                  get: (row) => row.name,
                },
                type: {
                  header: 'Type',
                  get: (row) => row.type,
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

  async add(client: typeof api, flags: FlagsType): Promise<void> {
    if (!flags.name) {
      this.log('Please provide a name for the accessory: \n  --name')
      this.exit(1)
    }

    if (flags.sms) {
      const payload: api.AddAccessoryRequest = {
        name: flags.name,
        type: 'sms',
        sms: flags.sms,
      }

      return handle(
        client.addAccessory(payload),
        withStandardErrors(
          {
            '201': (_response: any) => {
              this.log(`Accessory setup: ${flags.name}`)
            },
          },
          this,
        ),
      )
    }

    this.log(
      'Please provide one type flag either: \n  --' +
        accessoryTypeFlags.join('\n  --'),
    )
    this.exit(1)
  }

  async delete(client: typeof api, flags: FlagsType): Promise<void> {
    if (!flags.accessory) {
      this.log(
        'Please provide the accessory id: mailscript accessories delete --accessory <accessory-id>',
      )
      this.exit(1)
    }

    return handle(
      client.deleteAccessory(flags.accessory),
      withStandardErrors(
        {
          '204': (_response: any) => {
            this.log(`Accessory deleted: ${flags.accessory}`)
          },
        },
        this,
      ),
    )
  }
}
