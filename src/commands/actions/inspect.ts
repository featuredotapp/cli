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
        })
    }

    static args = [
        {
            name: 'id',
            required: true,
            description: 'id of the action'
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

    async inspect(client: typeof api, flags: any , args: any): Promise<void> {
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

        var importantObject = actions.find(({ id }: any) => id === args.id);
        if(!importantObject) {
            this.error("Action not found")
        }
        var tree: archy.Data = this._transformToArchy(importantObject, "Action", true)

        this.log(archy(tree))

        this.exit(0)
    }

    private _transformToArchy(
        objects: any[],
        label: string,
        recursive?: boolean
    ): archy.Data {
        var out: archy.Data = {
            label,
            nodes: [

            ]
        };
        for (var itemKey in objects) {
            var item: any = objects[itemKey];

            var nodes;
            if (typeof item === "string") {
                nodes = [
                    item
                ]
            } else {
                if (recursive === true) {
                    nodes = this._transformToArchy(item, "", recursive).nodes
                } else {
                    nodes = [
                        item.name,
                        item.id
                    ]
                }
            }

            out.nodes?.push({
                label: itemKey,
                nodes
            })
        }
        return out;
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
