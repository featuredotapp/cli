import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('Accessories', () => {
  describe('get', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/accessories').reply(200, { list: [] }),
      )
      .command(['accessories', 'list'])
      .exit(0)
      .it('gives message if no accessories', (ctx) => {
        expect(ctx.stdout).to.contain(
          "you don't have a accessories currently, create an address to add one: mailscript addresses add --address example@workspace.mailscript.com",
        )
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api
          .get('/accessories')
          .reply(200, { list: [{ name: 'test@mailscript.io' }] }),
      )
      .command(['accessories', 'list'])
      .it('lists accessories by name', (ctx) => {
        expect(ctx.stdout).to.contain('test@mailscript.io')
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api
          .get('/accessories')
          .reply(200, { list: [{ name: 'test@mailscript.io' }] }),
      )
      .command(['accessories'])
      .it('defaults to list', (ctx) => {
        expect(ctx.stdout).to.contain('test@mailscript.io')
      })
  })

  describe('add', () => {
    let postBody: any

    beforeEach(() => {
      postBody = {}
    })

    const nockAdd = (api: any) => {
      return api
        .post('/accessories', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'access-xxx-yyy-zzz' })
    }

    test
      .stdout()
      .nock(MailscriptApiServer, nockAdd)
      .command([
        'accessories',
        'add',
        '--name',
        'test-sms',
        '--sms',
        '+440776653376',
      ])
      .it('adds an accessory', (ctx) => {
        expect(ctx.stdout).to.contain('Accessory setup: test-sms')
        expect(postBody).to.eql({
          type: 'sms',
          name: 'test-sms',
          sms: '+440776653376',
        })
      })

    test
      .stdout()
      .command(['accessories', 'add', '--sms', '+440776653376'])
      .exit(1)
      .it('requires an accessory name', (ctx) => {
        expect(ctx.stdout).to.contain(
          'Please provide a name for the accessory: \n  --name',
        )
      })

    test
      .stdout()
      .command(['accessories', 'add', '--name', 'test-sms'])
      .exit(1)
      .it('requires an sms flag', (ctx) => {
        expect(ctx.stdout).to.contain(
          'Please provide one type flag either: \n  --sms',
        )
      })
  })

  describe('delete', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) => {
        return api.delete('/accessories/access-xxx-yyy-zzz').reply(204)
      })
      .command(['accessories', 'delete', '--accessory', 'access-xxx-yyy-zzz'])
      .it('deletes accessory on the server', (ctx) => {
        expect(ctx.stdout).to.contain('Accessory deleted: access-xxx-yyy-zzz')
      })

    test
      .stdout()
      .command(['accessories', 'delete'])
      .exit(1)
      .it('errors if no accessory id provided', (ctx) => {
        expect(ctx.stdout).to.contain(
          'Please provide the accessory id: mailscript accessories delete --accessory <accessory-id>',
        )
      })
  })
})
