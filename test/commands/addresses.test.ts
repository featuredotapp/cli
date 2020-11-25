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
})
