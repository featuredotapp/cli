import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('Addresses', () => {
  test
    .stdout()
    .nock(MailscriptApiServer, (api) =>
      api.get('/addresses').reply(200, { list: [] }),
    )
    .command(['addresses:list'])
    .exit(0)
    .it('gives message if no addresses', (ctx) => {
      expect(ctx.stdout).to.contain(
        "you don't have any addresses currently, create one with: mailscript addresses:add",
      )
    })

  test
    .stdout()
    .nock(MailscriptApiServer, (api) =>
      api
        .get('/addresses')
        .reply(200, { list: [{ id: 'test@mailscript.io' }] }),
    )
    .command(['addresses:list'])
    .it('lists addresses by id', (ctx) => {
      expect(ctx.stdout).to.contain('test@mailscript.io')
    })

  describe('add', () => {
    let addressBody: {} | undefined
    let keysBody: {} | undefined
    let accessoryBody: {} | undefined

    beforeEach(() => {
      addressBody = undefined
      keysBody = undefined
      accessoryBody = undefined
    })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api
          .post('/addresses', (body: any) => {
            addressBody = body
            return true
          })
          .reply(204, { id: 'xxx-yyy-zzz' })
          .post('/addresses/another@test.mailscript.io/keys', (body: any) => {
            keysBody = body
            return true
          })
          .reply(204, {})
          .post('/accessories', (body: any) => {
            accessoryBody = body
            return true
          })
          .reply(204, {}),
      )
      .command(['addresses:add', '--address', 'another@test.mailscript.io'])
      .it('adds address', (ctx) => {
        expect(ctx.stdout).to.contain('another@test.mailscript.io')

        expect(addressBody).to.eql({ address: 'another@test.mailscript.io' })
        expect(keysBody).to.eql({
          name: 'owner',
          read: true,
          write: true,
        })
        expect(accessoryBody).to.eql({
          address: 'another@test.mailscript.io',
          name: 'another@test.mailscript.io',
          type: 'mailscript-email',
        })
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api
          .post('/addresses', (body: any) => {
            addressBody = body
            return true
          })
          .reply(204, { id: 'xxx-yyy-zzz' })
          .post('/addresses/another@test.mailscript.io/keys', (body: any) => {
            keysBody = body
            return true
          })
          .reply(204, {})
          .post('/accessories', (body: any) => {
            accessoryBody = body
            return true
          })
          .reply(204, {}),
      )
      .command([
        'addresses:add',
        '--address',
        'another@test.mailscript.io',
        '--name',
        'Another',
      ])
      .it('adds address with display name', (ctx) => {
        expect(ctx.stdout).to.contain('another@test.mailscript.io')

        expect(addressBody).to.eql({
          address: 'another@test.mailscript.io',
          displayName: 'Another',
        })
        expect(keysBody).to.eql({
          name: 'owner',
          read: true,
          write: true,
        })
        expect(accessoryBody).to.eql({
          address: 'another@test.mailscript.io',
          name: 'another@test.mailscript.io',
          type: 'mailscript-email',
        })
      })
  })

  describe('delete', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) => {
        return api.delete('/addresses/smith@example.com').reply(204)
      })
      .command(['addresses:delete', '--address', 'smith@example.com'])
      .it('deletes address on the server', (ctx) => {
        expect(ctx.stdout).to.contain('Address deleted: smith@example.com')
      })

    test
      .stderr()
      .stdout()
      .command(['addresses:delete'])
      .exit(2)
      .it('errors if no address provided')
  })
})
