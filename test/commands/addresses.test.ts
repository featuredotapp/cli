import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('Addresses', () => {
  test
    .stdout()
    .nock(MailscriptApiServer, (api) =>
      api.get('/addresses').reply(200, { list: [] }),
    )
    .command(['addresses', 'list'])
    .exit(0)
    .it('gives message if no addresses', (ctx) => {
      expect(ctx.stdout).to.contain(
        "you don't have any addresses currently, create one with: mailscript addresses add",
      )
    })

  test
    .stdout()
    .nock(MailscriptApiServer, (api) =>
      api
        .get('/addresses')
        .reply(200, { list: [{ id: 'test@mailscript.io' }] }),
    )
    .command(['addresses', 'list'])
    .it('lists addresses by id', (ctx) => {
      expect(ctx.stdout).to.contain('test@mailscript.io')
    })

  test
    .stdout()
    .nock(MailscriptApiServer, (api) =>
      api
        .get('/addresses')
        .reply(200, { list: [{ id: 'test@mailscript.io' }] }),
    )
    .command(['addresses'])
    .it('defaults to list', (ctx) => {
      expect(ctx.stdout).to.contain('test@mailscript.io')
    })

  describe('delete', () => {
    describe('delete', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, (api) => {
          return api.delete('/addresses/smith@example.com').reply(204)
        })
        .command(['addresses', 'delete', '--address', 'smith@example.com'])
        .it('deletes address on the server', (ctx) => {
          expect(ctx.stdout).to.contain('Address deleted: smith@example.com')
        })

      test
        .stdout()
        .command(['addresses', 'delete'])
        .exit(1)
        .it('errors if no accessory id provided', (ctx) => {
          expect(ctx.stdout).to.contain(
            'lease provide the address: mailscript addresses delete --address <smith@example.com>',
          )
        })
    })
  })
})
