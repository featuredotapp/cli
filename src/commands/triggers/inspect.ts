/* eslint-disable no-await-in-loop */
import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import { flat } from '../../utils/flat'
import archy from 'archy'

export default class Sync extends Command {
  static description = 'export your Mailscript config to file'

  static flags = {
    help: flags.help({
      char: 'h',
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
    const { flags, args } = this.parse(Sync)
    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.inspect(client, flags, args)
  }

  async inspect(client: typeof api, flags: any, args: any): Promise<void> {
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

    const importantObject = triggers.find(({ id }: any) => id === args.id)
    if (!importantObject) {
      this.error('Trigger not found')
    }
    const tree: archy.Data = this._transformToArchy(
      importantObject,
      'Trigger',
      true,
    )

    this.log(archy(tree))
    // this.log(data)

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
      // out.nodes.push(this._transformToArchy(item))
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
