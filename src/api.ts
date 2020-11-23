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
  baseUrl: 'http://localhost:7000/v1',
}
const oazapfts = Oazapfts.runtime(defaults)
export const servers = {
  localDevelopmentServer: ({ port = '7000' }: { port: '7000' | '443' }) =>
    `http://localhost:7000/v1`,
}
export type AddWorkspaceRequest = {
  workspace: string
}
export type ErrorResponse = {
  error: string
}
export type Workspace = {
  id?: string
  owner?: string
  createdAt?: number
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
  createdAt?: number
  createdBy?: string
}
export type GetAllAddressesResponse = {
  list?: Address[]
}
export type Accessory = {
  id?: string
  type?: 'mailscript-email'
  createdAt?: number
  createdBy?: string
  name?: string
  address?: string
  sms?: string
  key?: string
}
export type GetAllAccessoriesResponse = {
  list?: Accessory[]
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
  createdAt?: number
  createdBy?: string
}
export type GetAllAutomationsResponse = {
  list?: Automation[]
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
        status: 200
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