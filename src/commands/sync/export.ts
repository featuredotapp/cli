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

    const triggers = (
      await handle(
        client.getAllTriggers(),
        withStandardErrors(
          { '200': ({ list }: api.GetAllTriggersResponse) => list },
          this,
        ),
      )
    )
      .map(({ id, name, composition }: any) => ({
        id,
        name,
        composition: composition.map((comp: any) => {
          if (comp.type === 'inner') {
            return {
              [comp.operand]: comp.nodes.map((n: { name: string }) => n.name),
            }
          }

          if (comp.type === 'leaf') {
            return { criteria: comp.criteria }
          }

          throw new Error(`Unknown composition type ${comp.type}`)
        }),
      }))
      .sort(({ name: left }: any, { name: right }: any) => {
        let comparison = 0

        if (left > right) {
          comparison = 1
        } else if (left < right) {
          comparison = -1
        }

        return comparison
      })

    const actionEntries = await handle(
      client.getAllActions(),
      withStandardErrors(
        { '200': ({ list }: api.GetAllActionsResponse) => list },
        this,
      ),
    )

    const actions = actionEntries.map(
      ({ id, type, name, config, list }: any) => {
        if (list) {
          return {
            id,
            name,
            list: list.map(
              (l: any) => actionEntries.find((ae: any) => ae.id === l).name,
            ),
          }
        }

        return {
          id,
          name,
          type,
          config: this._keyNameSubstitute(keys, config),
        }
      },
    )

    const inputs = await handle(
      client.getAllInputs(),
      withStandardErrors(
        { '200': ({ list }: api.GetAllInputsResponse) => list },
        this,
      ),
    )

    const workflows = (
      await handle(
        client.getAllWorkflows(),
        withStandardErrors(
          { '200': ({ list }: api.GetAllWorkflowsResponse) => list },
          this,
        ),
      )
    ).map(({ name, input, trigger, action }: api.Workflow) => {
      const foundTrigger = triggers.find(({ id }: any) => id === trigger)
      const inputName = inputs.find(({ id }: any) => id === input).name
      const actionName = actions.find(({ id }: any) => id === action).name

      if (!foundTrigger) {
        return {
          name,
          input: inputName,
          action: actionName,
        }
      }

      return {
        name,
        input: inputName,
        trigger: foundTrigger ? foundTrigger.name : undefined,
        action: actionName,
      }
    })

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
      version: '0.2',
      addresses: mergedAddressesAndKeys,
      triggers: triggers.map(({ id: _id, ...rest }: any) => rest),
      actions: actions.map(({ id: _id, ...rest }: any) => rest),
      workflows: workflows,
    })

    if (flags.path) {
      fs.writeFileSync(flags.path, data)
    } else {
      this.log(data)
    }

    this.exit(0)
  }

  private _keyNameSubstitute(
    keys: {
      address: string
      keys: any
    }[],
    config: any,
  ) {
    if (!config || !config.key) {
      return config
    }

    return {
      ...config,
      key: this._lookupKeyName(keys, config.key),
    }
  }

  private _lookupKeyName(
    keys: {
      address: string
      keys: any
    }[],
    keyId: string,
  ): string | null {
    if (!keyId) {
      return null
    }

    const key = keys
      .map((ke) => ke.keys)
      .flat()
      .find((k: { id: string }) => k.id === keyId)

    if (!key) {
      return null
    }

    return key.name
  }
}
