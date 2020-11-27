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
  update = 'update',
  delete = 'delete',
}

export default class Keys extends Command {
  static description = 'Manipulate address keys'

  static flags = {
    help: flags.help({ char: 'h' }),
    address: flags.string({
      description: 'the email address to look for keys against',
    }),
    key: flags.string({
      description: 'the id of the address key',
    }),
    read: flags.boolean({
      default: false,
      description: 'set the key with read permissions',
    }),
    write: flags.boolean({
      default: false,
      description: 'set the key with write permissions',
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
        return this.add(client, flags)
      case Subcommand.update:
        return this.update(client, flags)
      case Subcommand.delete:
        return this.delete(client, flags)
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

  async add(client: typeof api, flags: any): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide an address: mailscript keys add --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    if (!flags.write && !flags.read) {
      this.log(`A key must have either read or write permission`)
      this.exit(1)
    }

    return handle(
      client.addKey(flags.address, {
        read: flags.read,
        write: flags.write,
      }),
      withStandardErrors(
        {
          '201': ({ id }: api.AddKeyResponse) => {
            this.log(`Key added: ${id}`)
          },
          '404': () => {
            this.log(`Unknown address: ${flags.address}`)
            this.exit(1)
          },
        },
        this,
      ),
    )
  }

  async update(client: typeof api, flags: any): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide an address: mailscript keys update --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    if (!flags.key) {
      this.log(
        'Please provide the key id: mailscript keys update --address example@workspace.mailscript.com --key xxx',
      )
      this.exit(1)
    }

    if (!flags.write && !flags.read) {
      this.log(`A key must have either read or write permission`)
      this.exit(1)
    }

    return handle(
      client.updateKey(flags.address, flags.key, {
        read: flags.read,
        write: flags.write,
      }),
      withStandardErrors(
        {
          '200': ({ id }: api.AddKeyResponse) => {
            this.log(`Key updated: ${id}`)
          },
          '404': ({ error }: api.ErrorResponse) => {
            this.log(error)
            this.exit(1)
          },
        },
        this,
      ),
    )
  }

  async delete(client: typeof api, flags: any): Promise<void> {
    if (!flags.address) {
      this.log(
        'Please provide an address: mailscript keys delete --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    if (!flags.key) {
      this.log(
        'Please provide the key id: mailscript keys delete --address example@workspace.mailscript.com --key xxx',
      )
      this.exit(1)
    }

    return handle(
      client.deleteKey(flags.address, flags.key),
      withStandardErrors(
        {
          '200': (_response: any) => {
            this.log(`Key deleted: ${flags.key}`)
          },
          '404': ({ error }: api.ErrorResponse) => {
            this.log(error)
            this.exit(1)
          },
        },
        this,
      ),
    )
  }
}
