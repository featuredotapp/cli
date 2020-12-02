import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import cli from 'cli-ux'
import * as api from '../api'
import { assertNever } from '../utils/assertNever'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'
import resolveAddAccessoryRequestFrom from '../utils/resolveAddAccessoryRequestFrom'

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

    const data: any = yaml.safeLoad(fs.readFileSync(flags.path, 'utf8'))

    if (!data) {
      this.log('Problem parsing yaml file')
      this.exit(1)
    }

    const {
      addresses = [],
      keys = [],
      accessories = [],
      automations = [],
    } = data

    this.log('')
    this.log('Syncing to Mailscript')
    this.log('')

    await this._syncAddresses(client, addresses)
    await this._syncKeys(client, keys)
    await this._syncAccessories(client, accessories)
    await this._syncAutomations(client, automations)
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
        ).map(({ name, read, write }: api.Key) => ({ name, read, write }))
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
    )
      .filter(({ type }: api.Accessory) => type !== 'webhook')
      .map(
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

  private async _syncAddresses(client: typeof api, addresses: Array<any>) {
    cli.action.start('Syncing addresses')
    const response = await client.getAllAddresses()

    if (response.status !== 200) {
      this.log('Error syncing addresses')
      this.exit(1)
    }

    const {
      data: { list: existingAddresses },
    } = response

    // addresses
    for (const address of addresses) {
      const existingAddress = existingAddresses.find((a) => a.id === address)

      if (existingAddress) {
        continue
      }

      // add address
      // eslint-disable-next-line no-await-in-loop
      await handle(
        client.addAddress({ address }),
        withStandardErrors(
          {
            201: () => {
              // no-op
            },
          },
          this,
        ),
      )
    }

    cli.action.stop()
  }

  private async _syncKeys(client: typeof api, yamlKeys: Array<any>) {
    cli.action.start('Syncing keys')

    for (const { address, keys } of yamlKeys) {
      // eslint-disable-next-line no-await-in-loop
      const existingKeysResponse = await client.getAllKeys(address)

      if (existingKeysResponse.status !== 200) {
        this.log('Error syncing keys')
        this.exit(1)
      }

      const {
        data: { list: existingKeys },
      } = existingKeysResponse

      for (const key of keys) {
        const existingKey = existingKeys.find((ek) => ek.name === key.name)

        // add if missing
        if (!existingKey) {
          this.log('Adding')
          // eslint-disable-next-line no-await-in-loop
          await handle(
            client.addKey(address, {
              name: key.name,
              read: key.read,
              write: key.write,
            }),
            withStandardErrors({}, this),
          )

          continue
        }

        // update if different
        if (existingKey.read !== key.read || existingKey.write !== key.write) {
          this.log('Updating')

          // eslint-disable-next-line no-await-in-loop
          await handle(
            client.updateKey(address, key.key, {
              read: key.read,
              write: key.write,
            }),
            withStandardErrors({}, this),
          )

          continue
        }
      }
    }

    cli.action.stop()
  }

  private async _syncAccessories(
    client: typeof api,
    yamlAccessories: Array<any>,
  ) {
    cli.action.start('Sync accessories')

    const existingAccessoriesResponse = await client.getAllAccessories()

    if (existingAccessoriesResponse.status !== 200) {
      cli.action.stop('Error reading accessories')
      this.exit(1)
    }

    const {
      data: { list: existingAccessories },
    } = existingAccessoriesResponse

    for (const accessory of yamlAccessories) {
      if (accessory.type === 'webhook') {
        continue
      }

      const existingAccessory = existingAccessories.find(
        (ea) => ea.id === accessory.id,
      )

      if (!existingAccessory) {
        this.log('Adding accessory')

        const addAccessoryRequest = resolveAddAccessoryRequestFrom(accessory)

        // eslint-disable-next-line no-await-in-loop
        await handle(
          client.addAccessory(addAccessoryRequest),
          withStandardErrors({}, this),
        )

        continue
      }

      if (
        accessory.type === 'mailscript-email' &&
        (existingAccessory.type !== accessory.type ||
          existingAccessory.address !== accessory.address)
      ) {
        this.log('TBD - update the accessory')
      } else if (
        accessory.type === 'sms' &&
        (existingAccessory.type !== accessory.type ||
          existingAccessory.sms !== accessory.sms)
      ) {
        this.log('TBD - update the accessory')
      }
    }

    cli.action.stop()
  }

  private async _syncAutomations(
    client: typeof api,
    yamlAutomations: Array<any>,
  ) {
    cli.action.start('Syncing automations')

    const existingAutomationsResponse = await client.getAllAutomations()

    if (existingAutomationsResponse.status !== 200) {
      this.log('Error reading automations')
      this.exit(1)
    }

    const {
      data: { list: existingAutomations },
    } = existingAutomationsResponse

    for (const automation of yamlAutomations) {
      const existingAutomation = existingAutomations.find(
        (ea) => ea.id === automation.id,
      )

      if (!existingAutomation) {
        this.log('Adding automation')

        continue
      }

      // Determine whether to update
      this.log(JSON.stringify(existingAutomation, null, 2))
      this.log(automation)
    }

    cli.action.stop()
  }
}
