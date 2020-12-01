import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import * as api from '../api'
import { assertNever } from '../utils/assertNever'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'

type FlagsType = {
  help: void
  path: string | undefined
}

enum Subcommand {
  export = 'export',
  import = 'import',
  update = 'update',
}

export default class Sync extends Command {
  static description =
    'allows current setup to be exported, imported, or/and updated'

  static flags = {
    help: flags.help({ char: 'h' }),
    path: flags.string({
      char: 'p',
      description: 'path to the file to read/write',
    }),
  }

  static args = [
    {
      name: 'subcommand',
      required: true,
      default: Subcommand.export,
      options: Object.keys(Subcommand),
      parse: (input: string) => Subcommand[input as keyof typeof Subcommand],
    },
  ]

  async run() {
    const { args, flags } = this.parse(Sync)
    const client = await setupApiClient()
    const subcommand: Subcommand = args.subcommand

    switch (subcommand) {
      case Subcommand.update:
        return this.update()
      case Subcommand.export:
        return this.export(client, flags)
      case Subcommand.import:
        return this.import(client, flags)
      default:
        assertNever(subcommand)
    }
  }

  async update(): Promise<void> {
    this.log('TBD')
  }

  async import(client: typeof api, flags: FlagsType): Promise<void> {
    if (!flags.path) {
      this.log('Please provide a file to read from --path')
      this.exit(1)
    }

    this.log('TBD')

    // const data = yaml.safeLoad(fs.readFileSync(flags.path, 'utf8'))
    // console.log(data)

    // const {
    //   addresses = [],
    //   keys: allKeys = [],
    //   accessories = [],
    //   automations = [],
    // } = data

    // addresses
    // for (const address of addresses) {
    //   await handle(client.addAddress({ address }), withStandardErrors({}, this))
    // }

    // keys
    // for (const { address, read, write } of allKeys) {
    //   await handle(
    //     client.addKey(address, { read, write }),
    //     withStandardErrors({}, this),
    //   )
    // }

    // accessories
    // const accessoriesMap = new Map()
    // for (const accessory of accessories) {
    //   const id = await handle(
    //     client.addAccessory({}),
    //     withStandardErrors({ '201': ({ id }) => id }, this),
    //   )
    // }
    // automations
  }

  async export(client: typeof api, flags: FlagsType): Promise<void> {
    const addresses: Array<string> = (
      await handle(
        client.getAllAddresses(),
        withStandardErrors(
          { '200': ({ list }: api.GetAllAddressesResponse) => list },
          this,
        ),
      )
    ).map(({ id }: api.Address) => id)

    const keys = await Promise.all(
      addresses.map(async (address) => {
        const keys = (
          await handle(
            client.getAllKeys(address),
            withStandardErrors(
              { '200': ({ list }: api.GetAllKeysResponse) => list },
              this,
            ),
          )
        ).map(({ id, read, write }: api.Key) => ({ key: id, read, write }))
        return { address, keys }
      }),
    )

    const accessories = (
      await handle(
        client.getAllAccessories(),
        withStandardErrors(
          { '200': ({ list }: api.GetAllAccessoriesResponse) => list },
          this,
        ),
      )
    ).map(
      ({
        owner: _owner,
        createdAt: _createdAt,
        createdBy: _createdBy,
        ...rest
      }: api.Accessory) => ({
        ...Object.entries(rest).reduce(
          (p, [k, v]) => ({ ...p, ...(v ? { [k]: v } : []) }),
          {},
        ),
      }),
    )

    const automations = (
      await handle(
        client.getAllAutomations(),
        withStandardErrors(
          { '200': ({ list }: api.GetAllAutomationsResponse) => list },
          this,
        ),
      )
    ).map(({ trigger, actions }: api.Automation) => ({ trigger, actions }))

    const data = yaml.dump({
      addresses,
      keys,
      accessories,
      automations,
    })

    if (flags.path) {
      fs.writeFileSync(flags.path, data)
    } else {
      this.log(data)
    }

    this.exit(0)
  }
}
