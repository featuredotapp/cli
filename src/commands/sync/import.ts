/* eslint-disable no-await-in-loop */
import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import cli from 'cli-ux'
import deepEqual from 'deep-equal'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export default class Sync extends Command {
  static description = 'import and update config from file into Mailscript'

  static flags = {
    help: flags.help({ char: 'h' }),
    path: flags.string({
      char: 'p',
      description: 'path to the file to read/write',
      required: true,
    }),
    delete: flags.boolean({
      char: 'd',
      default: false,
      description: 'force delete of entities missing from import file',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(Sync)
    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.import(client, flags)
  }

  async import(
    client: typeof api,
    flags: { path: string; delete: boolean },
  ): Promise<void> {
    if (!flags.path) {
      this.log('Please provide a file to read from --path')
      this.exit(1)
    }

    if (!fs.existsSync(flags.path)) {
      this.log('Path does not exist')
      this.exit(1)
    }

    const data: any = yaml.safeLoad(fs.readFileSync(flags.path, 'utf8'))

    if (!data) {
      this.log('Problem parsing yaml file')
      this.exit(1)
    }

    const { addresses = [], triggers = [], actions = [] } = data

    this.log('')
    this.log('Syncing to Mailscript')
    this.log('')

    const forceDelete = flags.delete

    //await this._syncAddresses(client, addresses, forceDelete)
    //await this._syncKeys(client, addresses, forceDelete)
    await this._syncTriggers(client, triggers, forceDelete)
    //await this._syncActions(client, actions, forceDelete)
    // await this._syncWorkflows(client, workflows, forceDelete)
  }

  private async _syncTriggers(
    client: typeof api,
    triggers: Array<any>,
    forceDelete: boolean,
  ) {
    cli.action.start('Syncing triggers ')
    const response = await client.getAllTriggers()

    if (response.status !== 200) {
      this.log('Error syncing triggers')
      this.exit(1)
    }

    const {
      data: { list: existingTriggers },
    } = response

    const nameToIdMappings: { [key: string]: string } = existingTriggers.reduce(
      (acc, item) => ({ ...acc, [item.name]: item.id }),
      {},
    )

    const triggerBodies = []

    const resolveBody = (name: string, comp: any) => {
      if (comp.criteria) {
        return { type: 'leaf', payload: { name, criteria: comp.criteria } }
      }

      if (comp.or) {
        return {
          type: 'inner',
          payload: {
            name,
            criteria: {
              or: comp.or,
            },
          },
        }
      }

      if (comp.and) {
        return {
          type: 'inner',
          payload: {
            name,
            criteria: {
              and: comp.and,
            },
          },
        }
      }

      throw new Error('Unknown trigger composition shape')
    }

    for (const trigger of triggers) {
      const existingTrigger = existingTriggers.find(
        (a) => a.name === trigger.name,
      )

      if (existingTrigger) {
        continue
      }

      // add trigger
      const firstComposition = trigger.composition[0]

      const body = resolveBody(trigger.name, firstComposition)

      triggerBodies.push(body)
    }

    // leaves first
    for (const { payload } of triggerBodies.filter(
      ({ type }) => type === 'leaf',
    )) {
      const response = await client.addTrigger(payload)

      if (response.status !== 201) {
        this.log('Error: could not add trigger')
        this.exit(1)
      }

      const {
        data: { id },
      } = response

      nameToIdMappings[payload.name as string] = id
    }

    // inner second
    for (const { payload } of triggerBodies.filter(
      ({ type }) => type === 'inner',
    )) {
      if (payload.criteria.or) {
        payload.criteria.or = payload.criteria.or.map(
          (name: string) => nameToIdMappings[name],
        )
      }

      if (payload.criteria.and) {
        payload.criteria.and = payload.criteria.and.map(
          (name: string) => nameToIdMappings[name],
        )
      }

      // console.log(payload)
      await handle(client.addTrigger(payload), withStandardErrors({}, this))
    }

    if (forceDelete) {
      const namesToRetain = triggers.map((t) => t.name)

      const triggersToDelete = existingTriggers.filter(
        ({ name }) => !namesToRetain.includes(name),
      )

      for (const { id: triggerId } of triggersToDelete) {
        this.log(`Deleteing ${triggerId}`)

        await handle(
          client.deleteTrigger(triggerId),
          withStandardErrors({}, this),
        )
      }
    }

    cli.action.stop()
  }

  private async _syncAddresses(
    client: typeof api,
    addresses: Array<any>,
    forceDelete: boolean,
  ) {
    cli.action.start('Syncing addresses ')
    const response = await client.getAllAddresses()

    if (response.status !== 200) {
      this.log('Error syncing addresses')
      this.exit(1)
    }

    const {
      data: { list: existingAddresses },
    } = response

    // addresses
    for (const address of Object.keys(addresses)) {
      const existingAddress = existingAddresses.find((a) => a.id === address)

      if (existingAddress) {
        continue
      }

      // add address
      await handle(client.addAddress({ address }), withStandardErrors({}, this))
    }

    if (forceDelete) {
      const namesToRetain = Object.keys(addresses)

      const addressesToDelete = existingAddresses.filter(
        ({ id }) => !namesToRetain.includes(id),
      )

      for (const { id: address } of addressesToDelete) {
        this.log(`Deleteing ${address}`)
        await handle(
          client.deleteAddress(address),
          withStandardErrors({}, this),
        )
      }
    }

    cli.action.stop()
  }

  private async _syncKeys(
    client: typeof api,
    yamlAddresses: Array<any>,
    forceDelete: boolean,
  ) {
    cli.action.start('Syncing keys ')

    for (const [address, { keys }] of Object.entries(yamlAddresses)) {
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
          await handle(
            client.updateKey(address, key.key, {
              name: key.name,
              read: key.read,
              write: key.write,
            }),
            withStandardErrors({}, this),
          )

          continue
        }
      }

      if (forceDelete) {
        const namesToRetain = keys.map((k: { name: string }) => k.name)

        const keysToDelete = existingKeys.filter(
          ({ name }) => !namesToRetain.includes(name),
        )

        for (const { id: key } of keysToDelete) {
          this.log(`Deleteing ${key}`)
          await handle(
            client.deleteKey(address, key),
            withStandardErrors({}, this),
          )
        }
      }
    }

    cli.action.stop()
  }

  // private async _syncAccessories(
  //   client: typeof api,
  //   yamlAccessories: Array<any>,
  //   forceDelete: boolean,
  // ) {
  //   cli.action.start('Syncing accessories ')

  //   const existingAccessoriesResponse = await client.getAllAccessories()

  //   if (existingAccessoriesResponse.status !== 200) {
  //     cli.action.stop('Error reading accessories')
  //     this.exit(1)
  //   }

  //   const {
  //     data: { list: existingAccessories },
  //   } = existingAccessoriesResponse

  //   for (const yamlAccessory of yamlAccessories) {
  //     if (yamlAccessory.type === 'webhook') {
  //       continue
  //     }

  //     const existingAccessory = existingAccessories.find(
  //       (ea) => ea.name === yamlAccessory.name,
  //     )

  //     // eslint-disable-next-line no-await-in-loop
  //     const accessory = await this._accessoryKeySubstitution(
  //       client,
  //       yamlAccessory,
  //     )

  //     if (!existingAccessory) {
  //       const addAccessoryRequest = resolveAddAccessoryRequestFrom(accessory)

  //       await handle(
  //         client.addAccessory(addAccessoryRequest),
  //         withStandardErrors({}, this),
  //       )

  //       continue
  //     }

  //     if (yamlAccessory.type === 'mailscript-email') {
  //       if (
  //         existingAccessory.type !== accessory.type ||
  //         existingAccessory.address !== accessory.address ||
  //         existingAccessory.key !== accessory.key
  //       ) {
  //         const updateAccessoryRequest = resolveUpdateAccessoryRequestFrom(
  //           accessory,
  //         )

  //         await handle(
  //           client.updateAccessory(accessory.id, updateAccessoryRequest),
  //           withStandardErrors({}, this),
  //         )
  //       }
  //     } else if (
  //       accessory.type === 'sms' &&
  //       (existingAccessory.type !== accessory.type ||
  //         existingAccessory.sms !== accessory.sms)
  //     ) {
  //       const updateAccessoryRequest = resolveUpdateAccessoryRequestFrom(
  //         accessory,
  //       )

  //       await handle(
  //         client.updateAccessory(accessory.id, updateAccessoryRequest),
  //         withStandardErrors({}, this),
  //       )
  //     }
  //   }

  //   if (forceDelete) {
  //     const namesToRetain = yamlAccessories.map(
  //       (ya: { name: string }) => ya.name,
  //     )

  //     const accessoriesToDelete = existingAccessories
  //       .filter(({ name }) => !namesToRetain.includes(name))
  //       .filter(({ type }) => type !== 'webhook')

  //     for (const { id: accessory } of accessoriesToDelete) {
  //       await handle(
  //         client.deleteAccessory(accessory),
  //         withStandardErrors({}, this),
  //       )
  //     }
  //   }

  //   cli.action.stop()
  // }

  // private async _syncWorkflows(
  //   client: typeof api,
  //   yamlWorkflows: Array<any>,
  //   forceDelete: boolean,
  // ) {
  //   cli.action.start('Syncing workflows ')

  //   const existingWorkflowsResponse = await client.getAllWorkflows()

  //   if (existingWorkflowsResponse.status !== 200) {
  //     this.log('Error reading workflows')
  //     this.exit(1)
  //   }

  //   const {
  //     data: { list: existingWorkflows },
  //   } = existingWorkflowsResponse

  //   const { list: allAccessories } = await handle(
  //     client.getAllAccessories(),
  //     withStandardErrors({}, this),
  //   )

  //   for (const workflow of yamlWorkflows) {
  //     const existingWorkflow = existingWorkflows.find(
  //       (ea) => ea.name === workflow.name,
  //     )

  //     const resolvedWorkflow = this._substituteAccessoryIdWorkflow(
  //       allAccessories,
  //       workflow,
  //     )

  //     if (!existingWorkflow) {
  //       await handle(
  //         client.addWorkflow(resolvedWorkflow),
  //         withStandardErrors({}, this),
  //       )

  //       continue
  //     }

  //     if (
  //       !deepEqual(existingWorkflow.trigger, resolvedWorkflow.trigger) ||
  //       !deepEqual(existingWorkflow.actions, resolvedWorkflow.actions)
  //     ) {
  //       await handle(
  //         client.updateWorkflow(existingWorkflow.id, resolvedWorkflow),
  //         withStandardErrors({}, this),
  //       )
  //     }
  //   }

  //   if (forceDelete) {
  //     const namesToRetain = yamlWorkflows.map((ya: { name: string }) => ya.name)

  //     const workflowsToDelete = existingWorkflows.filter(
  //       ({ name }) => !namesToRetain.includes(name),
  //     )

  //     for (const { id: workflow } of workflowsToDelete) {
  //       await handle(
  //         client.deleteWorkflow(workflow),
  //         withStandardErrors({}, this),
  //       )
  //     }
  //   }

  //   cli.action.stop()
  // }

  private async _accessoryKeySubstitution(
    client: typeof api,
    yamlAccessory: any,
  ) {
    if (yamlAccessory.type !== 'mailscript-email') {
      return yamlAccessory
    }

    // eslint-disable-next-line no-await-in-loop
    const { list: addressKeys } = await handle(
      client.getAllKeys(yamlAccessory.address!),
      withStandardErrors({}, this),
    )

    const addressKey = addressKeys.find(
      (ak: any) => ak.name === yamlAccessory.key,
    )

    if (!addressKey) {
      cli.action.stop(`Error reading address key: ${yamlAccessory.key}`)
      this.exit(1)
    }

    return {
      ...yamlAccessory,
      key: addressKey.id,
    }
  }

  private _substituteAccessoryIdWorkflow(
    allAccessories: Array<any>,
    yamlWorkflow: any,
  ) {
    return {
      ...yamlWorkflow,
      trigger: this._substituteAccessoryIdFor(
        allAccessories,
        yamlWorkflow.trigger,
      ),
      actions: yamlWorkflow.actions.map((action: any) =>
        this._substituteAccessoryIdFor(allAccessories, action),
      ),
    }
  }

  private _substituteAccessoryIdFor(
    allAccessories: Array<any>,
    { accessory: name, ...rest }: any,
  ) {
    let accessory
    if (rest.config.type === 'webhook') {
      accessory = allAccessories.find((a) => a.type === 'webhook')
    } else {
      accessory = allAccessories.find((a) => a.name === name)
    }

    return {
      accessoryId: accessory.id,
      ...rest,
    }
  }
}
