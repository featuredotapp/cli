import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('keys', () => {
  let postBody: any

  beforeEach(() => {
    postBody = {}
  })

  describe('list', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/addresses/test@example.com/keys').reply(200, { list: [] }),
      )
      .command(['keys:list', '--address', 'test@example.com'])
      .exit(0)
      .it('gives message if no usernames', (ctx) => {
        expect(ctx.stdout).to.contain(
          "you don't have any keys against that address\n",
        )
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/addresses/test@example.com/keys').reply(200, {
          list: [
            {
              id: 'xxxUUUPPP',
              write: true,
              read: false,
            },
          ],
        }),
      )
      .command(['keys:list', '--address', 'test@example.com'])
      .it('lists keys by ids', (ctx) => {
        expect(ctx.stdout).to.contain(
          `
Keys for test@example.com

Id        Read  Write 
xxxUUUPPP false true`,
        )
      })
  })

  describe('add', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api
          .post('/addresses/test@example.com/keys', (body: any) => {
            postBody = body
            return true
          })
          .reply(201, { success: true, id: 'ZYUYAUYUjuop' }),
      )
      .command([
        'keys:add',
        '--name',
        'owner',
        '--address',
        'test@example.com',
        '--read',
      ])
      .it('responds with success', (ctx) => {
        expect(ctx.stdout).to.contain('Key added: ZYUYAUYUjuop')
        expect(postBody).to.eql({
          name: 'owner',
          read: true,
          write: false,
        })
      })

    test
      .stdout()
      .command(['keys:add', '--address', 'test@example.com'])
      .exit(2)
      .it('errors if no name set')

    test
      .stdout()
      .command(['keys:add', '--name', 'owner', '--address', 'test@example.com'])
      .exit(1)
      .it('errors if neither read/write set', (ctx) => {
        expect(ctx.stdout).to.contain(
          'A key must have either read or write permission',
        )
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api
          .post('/addresses/unknown@example.com/keys')
          .reply(404, { success: false, message: 'Address not found' }),
      )
      .command([
        'keys:add',
        '--name',
        'owner',
        '--address',
        'unknown@example.com',
        '--read',
      ])
      .exit(1)
      .it('errors not a known address', (ctx) => {
        expect(ctx.stdout).to.contain('Unknown address: unknown@example.com')
      })

    test.stdout().command(['keys:add']).exit(2).it('requires address flag')
  })

  describe('update', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api
          .put('/addresses/test@example.com/keys/ZYUYAUYUjuop', (body: any) => {
            postBody = body
            return true
          })
          .reply(200, { success: true, id: 'ZYUYAUYUjuop' }),
      )
      .command([
        'keys:update',
        '--address',
        'test@example.com',
        '--key',
        'ZYUYAUYUjuop',
        '--name',
        'another',
        '--read',
      ])
      .it('responds with success', (ctx) => {
        expect(ctx.stdout).to.contain('Key updated: ZYUYAUYUjuop')
        expect(postBody).to.eql({
          name: 'another',
          read: true,
          write: false,
        })
      })

    test.stdout().command(['keys:update']).exit(2).it('requires address flag')

    test
      .stdout()
      .command(['keys:update', '--address', 'test@example.com'])
      .exit(2)
      .it('requires key flag')

    test
      .stdout()
      .command([
        'keys:update',
        '--address',
        'test@example.com',
        '--key',
        'ZYUYAUYUjuop',
        '--name',
        'another',
      ])
      .exit(1)
      .it('requires read or write flag or both', (ctx) => {
        expect(ctx.stdout).to.contain(
          'A key must have either read or write permission',
        )
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api
          .put('/addresses/non-existant@example.com/keys/ZYUYAUYUjuop')
          .reply(404, { success: false, error: 'Key not found' }),
      )
      .command([
        'keys:update',
        '--address',
        'non-existant@example.com',
        '--key',
        'ZYUYAUYUjuop',
        '--name',
        'another',
        '--write',
      ])
      .exit(1)
      .it('deals with non-existance', (ctx) => {
        expect(ctx.stdout).to.contain('Key not found')
      })
  })

  describe('delete', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api
          .delete('/addresses/test@example.com/keys/ZYUYAUYUjuop')
          .reply(200, { success: true, id: 'ZYUYAUYUjuop' }),
      )
      .command([
        'keys:delete',
        '--address',
        'test@example.com',
        '--key',
        'ZYUYAUYUjuop',
      ])
      .it('responds with success', (ctx) => {
        expect(ctx.stdout).to.contain('Key deleted: ZYUYAUYUjuop')
      })

    test
      .stdout()
      .command(['keys:delete', '--key', 'ZYUYAUYUjuop'])
      .exit(2)
      .it('requires address flag')
  })
})
