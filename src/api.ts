/* eslint-disable valid-jsdoc, @typescript-eslint/no-unused-vars */
/**
 * Mailscript
 * 0.4.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from 'oazapfts/lib/runtime'
import * as QS from 'oazapfts/lib/runtime/query'
export const defaults: Oazapfts.RequestOpts = {
  baseUrl: 'https://api.mailscript.com/v1',
}
const oazapfts = Oazapfts.runtime(defaults)
export const servers = {
  apiServer: 'https://api.mailscript.com/v1',
  localDevelopmentServer: 'http://localhost:7000/v1',
}
export type User = {
  id: string
  displayName: string
  photoURL?: string
  email: string
  createdAt: string
}
export type ErrorResponse = {
  error: string
}
export type SendRequest = {
  to: string
  from: string
  subject: string
  text?: string
  html?: string
}
export type AddWorkspaceRequest = {
  workspace: string
}
export type Workspace = {
  id: string
  owner: string
  createdAt: string
  createdBy: string
}
export type GetAllWorkspacesResponse = {
  list: Workspace[]
}
export type AddAddressRequest = {
  address: string
}
export type Address = {
  id: string
  owner: string
  displayName?: string
  createdAt: string
  createdBy: string
}
export type GetAllAddressesResponse = {
  list: Address[]
}
export type Criteria = {
  sentTo?: string
  subjectContains?: string
  from?: string
  domain?: string
  hasTheWords?: string
  hasAttachments?: boolean
}
export type Trigger = {
  id: string
  owner: string
  displayName?: string
  createdAt: string
  createdBy: string
  name: string
  criteria: Criteria
}
export type GetAllTriggersResponse = {
  list: Trigger[]
}
export type CriteriaOperand = {
  and?: string[]
  or?: string[]
}
export type AddTriggerRequest = {
  name: string
  criteria: Criteria | CriteriaOperand
}
export type AddTriggerResponse = {
  id: string
}
export type MailscriptEmailInput = {
  id: string
  name: string
  type: 'mailescript-email'
  owner: string
  createdAt: string
  createdBy: string
  address: string
}
export type GetAllInputsResponse = {
  list: MailscriptEmailInput[]
}
export type AddWorkflowRequest = {
  name: string
  input: string
  trigger?: string
  action: string
}
export type Workflow = {
  id: string
  name: string
  owner: string
  createdAt: string
  createdBy: string
  input: string
  trigger: string
  action: string
}
export type GetAllWorkflowsResponse = {
  list: Workflow[]
}
export type Key = {
  id: string
  name: string
  read: boolean
  write: boolean
  createdBy: string
  createdAt: string
}
export type GetAllKeysResponse = {
  list: Key[]
}
export type AddKeyRequest = {
  name: string
  read: boolean
  write: boolean
}
export type AddKeyResponse = {
  id?: string
}
export type UpdateKeyRequest = {
  name: string
  read: boolean
  write: boolean
}
export type VerificationEmail = {
  id?: string
  type?: 'email'
  email?: string
  verified?: boolean
  verifiedBy?: string
  verifiedAt?: string
}
export type VerificationSms = {
  id?: string
  type?: 'sms'
  sms?: string
  verified?: boolean
  verifiedBy?: string
  verifiedAt?: string
}
export type GetAllVerificationsResponse = {
  list: (VerificationEmail | VerificationSms)[]
}
export type AddEmailVerificationRequest = {
  type: 'email'
  email: string
}
export type AddSmsVerificationRequest = {
  type: 'sms'
  sms: string
}
export type AddVerificationResponse = {
  id: string
}
export type VerifyEmailRequest = {
  email: string
  code: string
}
export type VerifySmsRequest = {
  sms: string
  code: string
}
export type ActionSend = {
  id: string
  name: string
  owner: string
  createdAt: string
  createdBy: string
  output: string
  config: {
    type: string
    subject: string
    text?: string
    html?: string
  }
}
export type ActionCombine = {
  id: string
  name: string
  owner: string
  createdAt: string
  createdBy: string
  list?: string[]
}
export type GetAllActionsResponse = {
  list: (ActionSend | ActionCombine)[]
}
export type AddActionCombineRequest = {
  name: string
  list: string[]
}
export type AddActionSmsRequest = {
  name: string
  type: 'sms'
  config: {
    number: string
    text: string
  }
}
export type AddActionWebhookRequest = {
  name: string
  type: 'webhook'
  config: {
    url: string
    opts: {
      headers: object
      method: 'POST' | 'GET' | 'DELETE'
    }
    body: string
  }
}
export type AddActionDaemonRequest = {
  name: string
  type: 'daemon'
  config: {
    daemon?: string
    body: string
  }
}
export type AddActionSendRequest = {
  name: string
  type: 'mailscript-email'
  config: {
    type?: 'send'
    to?: string
    subject: string
    text?: string
    html?: string
    from: string
    key: string
  }
}
export type AddActionForwardRequest = {
  name: string
  type: 'mailscript-email'
  config: {
    type: 'forward'
    forward: string
    from: string
    key: string
  }
}
export type AddActionReplyRequest = {
  name: string
  type: 'mailscript-email'
  config: {
    type: 'reply'
    text?: string
    html?: string
    from: string
    key: string
  }
}
export type AddActionReplyAllRequest = {
  name: string
  type: 'mailscript-email'
  config: {
    type: 'replyAll'
    text?: string
    html?: string
    from: string
    key: string
  }
}
export type AddActionAliasRequest = {
  name: string
  type: 'mailscript-email'
  config: {
    type?: 'alias'
    alias?: string
  }
}
export type AddActionResponse = {
  id: string
}
/**
 * Get the authenticated user
 */
export function getAuthenticatedUser(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: User
      }
    | {
        status: 403
        data: ErrorResponse
      }
  >('/user', {
    ...opts,
  })
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
 * Get all triggers you have access to
 */
export function getAllTriggers(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: GetAllTriggersResponse
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
  >('/triggers', {
    ...opts,
  })
}
/**
 * Setup a trigger
 */
export function addTrigger(
  addTriggerRequest: AddTriggerRequest,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 201
        data: AddTriggerResponse
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
    '/triggers',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: addTriggerRequest,
    }),
  )
}
/**
 * Update a trigger
 */
export function updateTrigger(
  trigger: string,
  addTriggerRequest: AddTriggerRequest,
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
        status: 404
        data: ErrorResponse
      }
  >(
    `/triggers/${trigger}`,
    oazapfts.json({
      ...opts,
      method: 'PUT',
      body: addTriggerRequest,
    }),
  )
}
/**
 * Delete a trigger
 */
export function deleteTrigger(trigger: string, opts?: Oazapfts.RequestOpts) {
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
  >(`/triggers/${trigger}`, {
    ...opts,
    method: 'DELETE',
  })
}
/**
 * Get all inputs you have access to
 */
export function getAllInputs(
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
        data: GetAllInputsResponse
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
    `/inputs${QS.query(
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
 * Setup workflow
 */
export function addWorkflow(
  addWorkflowRequest: AddWorkflowRequest,
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
    '/workflows',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: addWorkflowRequest,
    }),
  )
}
/**
 * Get all workflows you have access to
 */
export function getAllWorkflows(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: GetAllWorkflowsResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
    | {
        status: 405
        data: ErrorResponse
      }
  >('/workflows', {
    ...opts,
  })
}
/**
 * Update an workflow
 */
export function updateWorkflow(
  workflow: string,
  addWorkflowRequest: AddWorkflowRequest,
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
        status: 404
        data: ErrorResponse
      }
  >(
    `/workflows/${workflow}`,
    oazapfts.json({
      ...opts,
      method: 'PUT',
      body: addWorkflowRequest,
    }),
  )
}
/**
 * Delete a workflow
 */
export function deleteWorkflow(workflow: string, opts?: Oazapfts.RequestOpts) {
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
  >(`/workflows/${workflow}`, {
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
/**
 * Get all verificats for the user
 */
export function getAllVerifications(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: GetAllVerificationsResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
  >('/verifications', {
    ...opts,
  })
}
/**
 * Start verification process for external email address or sms number
 */
export function addVerification(
  body: AddEmailVerificationRequest | AddSmsVerificationRequest,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 201
        data: AddVerificationResponse
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
    '/verifications',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body,
    }),
  )
}
/**
 * Verify an email address or sms number with a code
 */
export function verify(
  verification: string,
  body: VerifyEmailRequest | VerifySmsRequest,
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
        status: 404
        data: ErrorResponse
      }
  >(
    `/verifications/${verification}/verify`,
    oazapfts.json({
      ...opts,
      method: 'POST',
      body,
    }),
  )
}
/**
 * Get all actions for the user
 */
export function getAllActions(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: GetAllActionsResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
  >('/actions', {
    ...opts,
  })
}
/**
 * Add an action
 */
export function addAction(
  body:
    | AddActionCombineRequest
    | AddActionSmsRequest
    | AddActionWebhookRequest
    | AddActionDaemonRequest
    | AddActionSendRequest
    | AddActionForwardRequest
    | AddActionForwardRequest
    | AddActionReplyRequest
    | AddActionReplyAllRequest
    | AddActionAliasRequest,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 201
        data: AddActionResponse
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
    '/actions',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body,
    }),
  )
}
/**
 * Update an action key
 */
export function updateAction(
  action: string,
  body:
    | AddActionCombineRequest
    | AddActionSmsRequest
    | AddActionWebhookRequest
    | AddActionDaemonRequest
    | AddActionSendRequest
    | AddActionForwardRequest
    | AddActionForwardRequest
    | AddActionReplyRequest
    | AddActionReplyAllRequest
    | AddActionAliasRequest,
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
    `/actions/${action}`,
    oazapfts.json({
      ...opts,
      method: 'PUT',
      body,
    }),
  )
}
/**
 * Delete an action
 */
export function deleteAction(action: string, opts?: Oazapfts.RequestOpts) {
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
  >(`/actions/${action}`, {
    ...opts,
    method: 'DELETE',
  })
}
/**
 * Get a token for opening a daemon connection
 */
export function getDaemonToken(daemon: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: {
          token: string
        }
      }
    | {
        status: 400
        data: ErrorResponse
      }
    | {
        status: 403
        data: ErrorResponse
      }
  >(`/daemons/${daemon}/token`, {
    ...opts,
  })
}
