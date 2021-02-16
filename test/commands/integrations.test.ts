import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('Integrations', () => {
  test
    .stdout()
    .nock(MailscriptApiServer, (api) =>
      api.get('/integrations').reply(200, { list: [] }),
    )
    .command(['integrations:list'])
    .exit(0)
    .it('gives message if no addresses', (ctx) => {
      expect(ctx.stdout).to.contain(
        "you don't have an integration currently, create one with: mailscript integrations:add",
      )
    })

  test
    .stdout()
    .nock(MailscriptApiServer, (api) =>
      api
        .get('/integrations')
        .reply(200, { list: [{ id: 'XXXYYYZZZ', type: 'google' }] }),
    )
    .command(['integrations:list'])
    .it('lists integrations by id', (ctx) => {
      expect(ctx.stdout).to.contain('google')
    })
})
