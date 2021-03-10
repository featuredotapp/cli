/* eslint-disable no-await-in-loop */
import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import cli from 'cli-ux'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import deepEqual from 'deep-equal'
import toposort from 'toposort'
import chalk from 'chalk'
import { askVerifySmsFlow } from '../../utils/askVerifySmsFlow'
import { askVerifyEmailFlow } from '../../utils/askVerifyEmailFlow'

type FlagsType = {
  noninteractive: boolean
  path: string
  delete: boolean
}

export default class Sync extends Command {
  static description = 'import and update config from file into Mailscript'

  static flags = {
    help: flags.help({ char: 'h' }),
    noninteractive: flags.boolean({
      description: 'do not ask for user input',
      default: false,
    }),
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

  async import(client: typeof api, flags: FlagsType): Promise<void> {
    if (!flags.path) {
      this.log('Please provide a file to read from --path')
      this.exit(1)
    }

    if (!fs.existsSync(flags.path)) {
      this.log('Path does not exist')
      this.exit(1)
    }

    const user: api.User = await handle(
      client.getAuthenticatedUser(),
      withStandardErrors({}, this),
    )

    const { list }: api.GetAllWorkspacesResponse = await handle(
      client.getAllWorkspaces(),
      withStandardErrors({}, this),
    )

    const username = list[0].id
    const accountEmailAddress = user.email

    const importFileContent = fs.readFileSync(flags.path, 'utf8')
    const interpolatedImportFileContent = importFileContent
      .toString()
      .replace(/\$account-email-address/g, accountEmailAddress)
      .replace(/\$username/g, username)

    const data: any = yaml.safeLoad(interpolatedImportFileContent)

    if (!data) {
      this.log('Problem parsing yaml file')
      this.exit(1)
    }

    const { addresses = [], triggers = [], actions = [], workflows = [] } = data

    this.log('')
    this.log('Syncing to Mailscript')
    this.log('')

    const forceDelete = flags.delete

    this.debug('Checking verifications')
    await this._checkVerificationsForActions(
      client,
      flags,
      accountEmailAddress,
      actions,
    )

    await this._syncAddresses(client, addresses, forceDelete)
    await this._syncKeys(client, addresses, forceDelete)

    const triggerIdMappings = await this._syncTriggers(
      client,
      triggers,
      forceDelete,
    )

    const actionIdMappings = await this._syncActions(
      client,
      actions,
      forceDelete,
    )

    await this._syncWorkflows(
      client,
      workflows,
      triggerIdMappings,
      actionIdMappings,
      forceDelete,
    )
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
        this.log(`Deleting ${address}`)
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
          this.log(`Deleting ${key}`)
          await handle(
            client.deleteKey(address, key),
            withStandardErrors({}, this),
          )
        }
      }
    }

    cli.action.stop()
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

    for (const trigger of this._sortTriggersByDependency(triggers)) {
      const existingTrigger = existingTriggers.find(
        (a) => a.name === trigger.name,
      )

      if (existingTrigger) {
        // if change, queue update
        if (this._diffTriggers(existingTrigger, trigger)) {
          const payload = this._resolveTriggerPayload(trigger, nameToIdMappings)

          await handle(
            client.updateTrigger(existingTrigger.id, payload),
            withStandardErrors({}, this),
          )
        }

        continue
      }

      // queue add trigger
      const payload = this._resolveTriggerPayload(trigger, nameToIdMappings)

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

    if (forceDelete) {
      const namesToRetain = triggers.map((t) => t.name)

      const triggersToDelete = existingTriggers.filter(
        ({ name }) => !namesToRetain.includes(name),
      )

      for (const { id: triggerId } of triggersToDelete) {
        this.log(`Deleting ${triggerId}`)

        await handle(
          client.deleteTrigger(triggerId),
          withStandardErrors({}, this),
        )
      }
    }

    cli.action.stop()

    return nameToIdMappings
  }

  private async _syncActions(
    client: typeof api,
    actions: Array<any>,
    forceDelete: boolean,
  ) {
    cli.action.start('Syncing actions ')
    const response = await client.getAllActions()

    if (response.status !== 200) {
      this.log('Error syncing actions')
      this.exit(1)
    }

    const {
      data: { list: existingActions },
    } = response

    const nameToIdMappings: { [key: string]: string } = existingActions.reduce(
      (acc, item) => ({ ...acc, [item.name]: item.id }),
      {},
    )

    const idToNameMappings: { [key: string]: string } = existingActions.reduce(
      (acc, item) => ({ ...acc, [item.id]: item.name }),
      {},
    )

    for (const action of this._sortActionsByDependency(actions)) {
      const existingAction = existingActions.find((a) => a.name === action.name)

      const payload = await this._resolvePayload(
        client,
        action,
        nameToIdMappings,
      )

      if (existingAction) {
        if (
          payload.list &&
          deepEqual((existingAction as api.ActionCombine).list, payload.list)
        ) {
          continue
        }

        if (
          !payload.list &&
          deepEqual((existingAction as api.ActionSend).config, payload.config)
        ) {
          continue
        }

        await handle(
          client.updateAction(existingAction.id, payload),
          withStandardErrors({}, this),
        )

        continue
      }

      const response = await client.addAction(payload)

      if (response.status !== 201) {
        this.log(
          chalk.red(
            `${chalk.bold('Error')}: could not add action - ${
              response.data.error
            }`,
          ),
        )
        this.exit(1)
      }

      const {
        data: { id },
      } = response

      nameToIdMappings[payload.name as string] = id
      idToNameMappings[id] = payload.name
    }

    if (forceDelete) {
      const namesToRetain = actions.map((t) => t.name)

      const actionsToDelete = existingActions.filter(
        ({ name }) => !namesToRetain.includes(name),
      )

      for (const { id: actionId } of actionsToDelete) {
        this.log(`Deleting action ${actionId}`)

        await handle(
          client.deleteAction(actionId),
          withStandardErrors({}, this),
        )
      }
    }

    cli.action.stop()

    return nameToIdMappings
  }

  // eslint-disable-next-line max-params
  private async _syncWorkflows(
    client: typeof api,
    yamlWorkflows: Array<any>,
    triggerIdsMappings: { [key: string]: string },
    actionIdMappings: { [key: string]: string },
    forceDelete: boolean,
  ) {
    cli.action.start('Syncing workflows ')
    const workflowsResponse = await client.getAllWorkflows()

    if (workflowsResponse.status !== 200) {
      this.log('Error syncing workflows')
      this.exit(1)
    }

    const {
      data: { list: existingWorkflows },
    } = workflowsResponse

    const inputsResponse = await client.getAllInputs()

    const inputs = inputsResponse.status === 200 ? inputsResponse.data.list : []

    const inputIdsMappings = inputs.reduce(
      (acc, item) => ({ ...acc, [item.name]: item.id }),
      {},
    )

    for (const workflow of yamlWorkflows) {
      const existingWorkflow = existingWorkflows.find(
        (ea) => ea.name === workflow.name,
      )

      const payload = await this._resolveWorkflow(
        workflow,
        inputIdsMappings,
        triggerIdsMappings,
        actionIdMappings,
      )

      if (!payload.input) {
        this.log('Error reading inputs')
        this.exit(1)
      }

      if (existingWorkflow) {
        if (
          existingWorkflow.input === payload.input &&
          existingWorkflow.trigger === payload.trigger &&
          existingWorkflow.action === payload.action
        ) {
          continue
        }

        await handle(
          client.updateWorkflow(existingWorkflow.id, payload),
          withStandardErrors({}, this),
        )

        continue
      }

      await handle(client.addWorkflow(payload), withStandardErrors({}, this))
    }

    if (forceDelete) {
      const namesToRetain = yamlWorkflows.map((t) => t.name)

      const actionsToDelete = existingWorkflows.filter(
        ({ name }) => !namesToRetain.includes(name),
      )

      for (const { id: workflowId } of actionsToDelete) {
        this.log(`Deleting workflow ${workflowId}`)

        await handle(
          client.deleteWorkflow(workflowId),
          withStandardErrors({}, this),
        )
      }
    }

    cli.action.stop()
  }

  private async _resolvePayload(
    client: typeof api,
    action: any,
    nameToIdMappings: { [key: string]: string },
  ) {
    if (!action.type && action.list) {
      return {
        ...action,
        list: action.list.map((name: string) => nameToIdMappings[name]),
      }
    }

    if (action.type === 'mailscript-email') {
      const from = action.config.from
      const mailtype = action.config.type

      if (mailtype === 'alias') {
        return action
      }

      if (!from) {
        this.log(
          chalk.red(
            `${chalk.bold('Error')}: No \`from\` address specified in action ${
              action.name
            }`,
          ),
        )
        this.exit(1)
      }

      const keyName = action.config.key

      const keysResponse = await client.getAllKeys(from)

      if (keysResponse.status !== 200) {
        this.log('Error getting address keys')
        this.exit(1)
      }

      const {
        data: { list: keys },
      } = keysResponse

      const foundKey = keys.find(({ name }) => name === keyName)

      if (!foundKey) {
        this.log(`Could not find key ${keyName} for action ${action.name}`)
        this.exit(1)
      }

      return {
        ...action,
        config: {
          ...action.config,
          key: foundKey.id,
        },
      }
    }

    if (action.type === 'sms') {
      return action
    }

    if (action.type === 'webhook') {
      return action
    }

    if (action.type === 'daemon') {
      return action
    }

    throw new Error(`Unknown action type ${action.type}`)
  }

  private async _resolveWorkflow(
    workflow: any,
    inputIdsMappings: { [key: string]: string },
    triggerIdsMappings: { [key: string]: string },
    actionIdMappings: { [key: string]: string },
  ) {
    return {
      ...workflow,
      input: inputIdsMappings[workflow.input],
      trigger: triggerIdsMappings[workflow.trigger],
      action: actionIdMappings[workflow.action],
    }
  }

  private _diffTriggers(existingTrigger: any, yamlTrigger: any) {
    if (existingTrigger.composition[0].type === 'leaf') {
      return !deepEqual(
        existingTrigger.composition[0].criteria,
        yamlTrigger.composition[0].criteria,
      )
    }

    if (
      existingTrigger.composition[0].type === 'inner' &&
      existingTrigger.composition[0].operand === 'or'
    ) {
      if (!yamlTrigger.composition[0].or) {
        return false
      }

      const existingTriggerNames = existingTrigger.composition[0].nodes.map(
        ({ name }: { name: string }) => name,
      )

      return !deepEqual(existingTriggerNames, yamlTrigger.composition[0].or)
    }

    if (
      existingTrigger.composition[0].type === 'inner' &&
      existingTrigger.composition[0].operand === 'and'
    ) {
      if (!yamlTrigger.composition[0].and) {
        return false
      }

      const existingTriggerNames = existingTrigger.composition[0].nodes.map(
        ({ name }: { name: string }) => name,
      )

      return !deepEqual(existingTriggerNames, yamlTrigger.composition[0].and)
    }

    return false
  }

  private _sortTriggersByDependency(triggers: any) {
    let nodes: Array<Array<string>> = []

    for (const trigger of triggers) {
      const firstComposition = trigger.composition[0]

      const links = firstComposition.criteria
        ? []
        : firstComposition.or || firstComposition.and

      const entries = links.map((l: string) => [trigger.name, l])

      nodes = [...nodes, [trigger.name], ...entries]
    }

    const sortedNodes = toposort(nodes as any)
      .reverse()
      .filter(Boolean)

    const sortedTriggers = sortedNodes.map((name) =>
      triggers.find((t: any) => t.name === name),
    )

    return sortedTriggers
  }

  private _sortActionsByDependency(actions: any) {
    let nodes: Array<Array<string>> = []

    for (const action of actions) {
      const { name, list } = action

      if (!list) {
        nodes.push([name])
        continue
      }

      const entries = list.map((l: string) => [name, l])

      nodes = [...nodes, ...entries]
    }

    const sortedNodes = toposort(nodes as any)
      .filter(Boolean)
      .reverse()

    const sortedActions = sortedNodes.map((name) =>
      actions.find((t: any) => t.name === name),
    )

    return sortedActions
  }

  private _resolveTriggerPayload(
    trigger: any,
    nameToIdMappings: { [key: string]: string },
  ) {
    const name = trigger.name
    const comp = trigger.composition[0]

    if (comp.criteria) {
      return { name, criteria: comp.criteria }
    }

    if (comp.or) {
      return {
        name,
        criteria: {
          or: comp.or.map((name: string) => nameToIdMappings[name]),
        },
      }
    }

    if (comp.and) {
      return {
        name,
        criteria: {
          and: comp.and.map((name: string) => nameToIdMappings[name]),
        },
      }
    }

    throw new Error('Unknown trigger composition shape')
  }

  private async _checkVerificationsForActions(
    client: typeof api,
    flags: FlagsType,
    accountEmailAddress: string,
    actions: any,
  ) {
    const leafActions = actions.filter(({ type }: any) => Boolean(type))

    const aliasAddresses = leafActions
      .filter(
        ({ type, config: { type: mailtype } }: any) =>
          type === 'mailscript-email' && mailtype === 'alias',
      )
      .map(({ config: { alias } }: any) => alias)

    const smsNumbers = leafActions
      .filter(({ type }: any) => type === 'sms')
      .map(({ config: { number } }: any) => number)

    const {
      list: verifications,
    }: api.GetAllVerificationsResponse = await handle(
      client.getAllVerifications(),
      withStandardErrors({}, this),
    )

    for (const smsNumber of smsNumbers) {
      const verification = verifications.find(
        (v) => v.type === 'sms' && v.sms === smsNumber,
      )

      if (!verification || !verification.verified) {
        await askVerifySmsFlow(
          client,
          smsNumber,
          `Cannot import, unverified number ${smsNumber}`,
          flags.noninteractive,
          this,
        )
      }
    }

    for (const aliasAddress of aliasAddresses) {
      if (aliasAddress === accountEmailAddress) {
        continue
      }

      const verification = verifications.find(
        (v) => v.type === 'email' && v.email === aliasAddress,
      )

      if (!verification || !verification.verified) {
        await askVerifyEmailFlow(
          client,
          aliasAddress,
          `Cannot import, unverified alias address ${aliasAddress}`,
          flags.noninteractive,
          this,
        )
      }
    }
  }
}
