/* eslint-disable no-await-in-loop */
import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import { flat } from '../../utils/flat'
import archy from 'archy'

export default class Inspect extends Command {
  static description = 'Inspect the tree of your workflow'

  static flags = {
    help: flags.help({
      char: 'h',
    }),
    explicit: flags.boolean({
      char: 'e',
      description: 'Show information that may compromise account security.',
    }),
    verbose: flags.boolean({
      char: 'v',
      description: 'Verbose',
    }),
  }

  static args = [
    {
      name: 'id',
      required: true,
      description: 'id of the workflow',
    },
  ]

  async run() {
    const { flags, args } = this.parse(Inspect)
    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.inspect(client, flags, args)
  }

  async inspect(
    client: typeof api,
    flags: { path?: string; explicit?: boolean; verbose?: boolean },
    args: any,
  ): Promise<void> {
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
        {
          '200': ({ list }: api.GetAllInputsResponse) => list,
          '403': () => [],
        },
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
    ).map(({ name, input, trigger, action, id }: api.Workflow) => {
      const cleanedInputs = inputs.map(
        (ixl: {
          createdBy?: string
          createdAt?: string
          id?: string
          key?: string
          name?: string
          owner?: string
        }) => {
          delete ixl.createdBy
          delete ixl.createdAt
          delete ixl.createdAt
          if (!flags.explicit) {
            delete ixl.key
          }
          if (!flags.verbose) {
            delete ixl.owner
            delete ixl.name
          }
          return ixl
        },
      )
      const foundTrigger = triggers.find(({ id }: any) => id === trigger)
      const inputName = cleanedInputs.find(({ id }: any) => id === input)
      const actionName = actions.find(({ id }: any) => id === action)

      // console.log(id)
      // console.log(foundTrigger)
      if (!foundTrigger) {
        return {
          id,
          name,
          input: inputName,
          action: actionName,
        }
      }

      return {
        name,
        id,
        input: inputName,
        trigger: foundTrigger ? foundTrigger.name : undefined,
        action: actionName,
      }
    })
    /* const data = yaml.dump({
            version: '0.2',
            workflows: workflows.find(({ id }: any) => id === args.id),
        }) */
    const tree: archy.Data = this._transformToArchy(
      workflows.find(({ id }: any) => id === args.id),
      'workflow',
      true,
    )

    this.log(archy(tree))

    this.exit(0)
  }

  private _transformToArchy(
    objects: any[],
    label: string,
    recursive?: boolean,
  ): archy.Data {
    const out: archy.Data = {
      label,
      nodes: [],
    }
    // eslint-disable-next-line guard-for-in
    for (const itemKey in objects) {
      const item: any = objects[itemKey]

      let nodes
      // console.log(`LN 236 is ${typeof item} or ${item}`)
      if (typeof item === 'string') {
        nodes = [item]
      } else if (recursive === true) {
        // console.log(item)

        nodes = this._transformToArchy(item, '', recursive).nodes
      } else {
        nodes = [item.name, item.id]
      }

      out.nodes?.push({
        label: itemKey,
        nodes,
      })
    }
    return out
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

    const key = flat(keys.map((ke) => ke.keys)).find(
      (k: { id: string }) => k.id === keyId,
    )

    if (!key) {
      return null
    }

    return key.name
  }
}
