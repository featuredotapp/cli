/* eslint-disable valid-jsdoc, @typescript-eslint/no-unused-vars */
/**
 * Mailscript
 * 0.1.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from 'oazapfts/lib/runtime'
import * as QS from 'oazapfts/lib/runtime/query'
export const defaults: Oazapfts.RequestOpts = {
  baseUrl: 'https://mailscript-api.herokuapp.com/v1',
}
const oazapfts = Oazapfts.runtime(defaults)
export const servers = {
  productionServer: 'https://mailscript-api.herokuapp.com/v1',
  localDevelopmentServer: 'http://localhost:7000/v1',
}
export type SendRequest = {
  to: string
  from: string
  subject: string
  text?: string
}
export type ErrorResponse = {
  error: string
}
export type AddWorkspaceRequest = {
  workspace: string
}
export type Workspace = {
  id?: string
  owner?: string
  createdAt?: string
  createdBy?: string
}
export type GetAllWorkspacesResponse = {
  list?: Workspace[]
}
export type AddAddressRequest = {
  address: string
}
export type Address = {
  id?: string
  owner?: string
  createdAt?: string
  createdBy?: string
}
export type GetAllAddressesResponse = {
  list?: Address[]
}
export type Accessory = {
  id?: string
  type?: 'mailscript-email' | 'sms'
  createdAt?: string
  createdBy?: string
  name?: string
  address?: string
  sms?: string
  key?: string
}
export type GetAllAccessoriesResponse = {
  list?: Accessory[]
}
export type AddAccessoryRequest = {
  name: string
  type: 'sms'
  sms: string
}
export type AddAutomationRequest = {
  trigger?: {
    accessoryId?: string
    config?: object
  }
  actions?: {
    accessoryId?: string
    config?: object
  }[]
}
export type Automation = {
  id?: string
  createdAt?: string
  createdBy?: string
}
export type GetAllAutomationsResponse = {
  list?: Automation[]
}
export type Key = {
  id: string
  read: boolean
  write: boolean
  createdBy?: string
  createdAt?: string
}
export type GetAllKeysResponse = {
  list?: Key[]
}
export type AddKeyRequest = {
  read: boolean
  write: boolean
}
export type AddKeyResponse = {
  success?: boolean
  id?: string
}
export type UpdateKeyRequest = {
  read: boolean
  write: boolean
}
/**
 * Send an email
 */
export function send(sendRequest: SendRequest, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
  >(
    '/send',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: sendRequest,
    }),
  )
}
/**
 * Claim a Mailscript workspace
 */
export function addWorkspace(
  addWorkspaceRequest: AddWorkspaceRequest,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 201
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >(
    '/workspaces',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: addWorkspaceRequest,
    }),
  )
}
/**
 * Get all workspaces you have access to
 */
export function getAllWorkspaces(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: GetAllWorkspacesResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >('/workspaces', {
    ...opts,
  })
}
/**
 * Claim a new Mailscript address
 */
export function addAddress(
  addAddressRequest: AddAddressRequest,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 200
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >(
    '/addresses',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: addAddressRequest,
    }),
  )
}
/**
 * Get all addresses you have access to
 */
export function getAllAddresses(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: GetAllAddressesResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >('/addresses', {
    ...opts,
  })
}
/**
 * Delete a mailscript address
 */
export function deleteAddress(address: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 204
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >(`/addresses/${address}`, {
    ...opts,
    method: 'DELETE',
  })
}
/**
 * Get all accessories you have access to
 */
export function getAllAccessories(
  {
    name,
  }: {
    name?: string
  } = {},
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: GetAllAccessoriesResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >(
    `/accessories${QS.query(
      QS.form({
        name,
      }),
    )}`,
    {
      ...opts,
    },
  )
}
/**
 * Setup an accessory
 */
export function addAccessory(
  addAccessoryRequest: AddAccessoryRequest,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 201
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >(
    '/accessories',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: addAccessoryRequest,
    }),
  )
}
/**
 * Get an accessory
 */
export function getAccessory(id: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: Accessory
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >(`/accessories/${id}`, {
    ...opts,
  })
}
/**
 * Delete an accessory
 */
export function deleteAccessory(id: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 204
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 404
        data: ErrorResponse
      }
  >(`/accessories/${id}`, {
    ...opts,
    method: 'DELETE',
  })
}
/**
 * Setup an automation
 */
export function addAutomation(
  addAutomationRequest: AddAutomationRequest,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 201
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >(
    '/automations',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: addAutomationRequest,
    }),
  )
}
/**
 * Get all automations you have access to
 */
export function getAllAutomations(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: GetAllAutomationsResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >('/automations', {
    ...opts,
  })
}
/**
 * Delete an automation
 */
export function deleteAutomation(
  automation: string,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 204
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 404
        data: ErrorResponse
      }
  >(`/automations/${automation}`, {
    ...opts,
    method: 'DELETE',
  })
}
/**
 * List address keys
 */
export function getAllKeys(address: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: GetAllKeysResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 404
        data: ErrorResponse
      }
  >(`/addresses/${address}/keys`, {
    ...opts,
  })
}
/**
 * Add address key
 */
export function addKey(
  address: string,
  addKeyRequest: AddKeyRequest,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 201
        data: AddKeyResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 404
        data: ErrorResponse
      }
  >(
    `/addresses/${address}/keys`,
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: addKeyRequest,
    }),
  )
}
/**
 * Get address key
 */
export function getKey(
  address: string,
  key: string,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: Key
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 404
        data: ErrorResponse
      }
  >(`/addresses/${address}/keys/${key}`, {
    ...opts,
  })
}
/**
 * Update an address key
 */
export function updateKey(
  address: string,
  key: string,
  updateKeyRequest: UpdateKeyRequest,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: Key
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 404
        data: ErrorResponse
      }
  >(
    `/addresses/${address}/keys/${key}`,
    oazapfts.json({
      ...opts,
      method: 'PUT',
      body: updateKeyRequest,
    }),
  )
}
/**
 * Delete address key
 */
export function deleteKey(
  address: string,
  key: string,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 204
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 404
        data: ErrorResponse
      }
  >(`/addresses/${address}/keys/${key}`, {
    ...opts,
    method: 'DELETE',
  })
}
