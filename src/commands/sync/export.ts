/* eslint-disable no-await-in-loop */
import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class Sync extends Command {
  static description = 'export your Mailscript config to file'

  static flags = {
    help: flags.help({ char: 'h' }),
    path: flags.string({
      char: 'p',
      description: 'path to the file to read/write',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(Sync)
    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.export(client, flags)
  }

  async export(client: typeof api, flags: { path?: string }): Promise<void> {
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
        ).map(({ id, name, read, write }: api.Key) => ({
          id,
          name,
          read,
          write,
        }))
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
          id,
          owner: _owner,
          createdAt: _createdAt,
          createdBy: _createdBy,
          name,
          type,
          ...rest
        }: api.Accessory) => ({
          id,
          name,
          type,
          ...rest,
          ...this._lookupKeyName(keys, rest.key),
        }),
      )

    const workflows = (
      await handle(
        client.getAllWorkflows(),
        withStandardErrors(
          { '200': ({ list }: api.GetAllWorkflowsResponse) => list },
          this,
        ),
      )
    ).map(({ name, trigger, actions }: api.Workflow) => ({
      name,
      trigger: this._mapAccessory(accessories, trigger),
      actions: actions.map((action: any) =>
        this._mapAccessory(accessories, action),
      ),
    }))

    const mergedAddressesAndKeys = Object.fromEntries(
      addresses.map((address) => {
        const keyEntry = keys.find((ke) => ke.address === address)

        if (!keyEntry) {
          return [address, {}]
        }

        return [
          address,
          {
            keys: keyEntry.keys.map(({ id: _id, ...rest }: any) => ({
              ...rest,
            })),
          },
        ]
      }),
    )

    const data = yaml.dump({
      version: '0.1',
      addresses: mergedAddressesAndKeys,
      accessories: accessories.map(({ id: _id, ...rest }: any) => rest),
      workflows: workflows,
    })

    if (flags.path) {
      fs.writeFileSync(flags.path, data)
    } else {
      this.log(data)
    }

    this.exit(0)
  }

  private _lookupKeyName(
    keys: {
      address: string
      keys: any
    }[],
    keyId: string,
  ): {} {
    if (!keyId) {
      return {}
    }

    const key = keys
      .map((ke) => ke.keys)
      .flat()
      .find((k: { id: string }) => k.id === keyId)

    if (!key) {
      return {}
    }

    return { key: key.name }
  }

  private _mapAccessory(
    accessories: Array<any>,
    { accessoryId, ...rest }: { accessoryId: string },
  ) {
    const accessory = accessories.find((acc) => acc.id === accessoryId)

    if (!accessory) {
      return {
        ...rest,
      }
    }

    return {
      accessory: accessory.name,
      ...rest,
    }
  }
}
