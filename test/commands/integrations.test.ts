import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('Integrations', () => {
  describe('add', () => {
    test
      .stdout()
      .command(['integrations:add'])
      .exit(1)
      .it('errors on no integrations specified', (ctx) => {
        expect(ctx.stdout).to.contain(
          'Please provide an integrations to be setup, one of:\n  --gdrive\n  --zoom\n',
        )
      })

    test
      .stdout()
      .command(['integrations:add', '--gdrive', '--zoom'])
      .exit(1)
      .it('errors if more than one integration is specified', (ctx) => {
        expect(ctx.stdout).to.contain(
          'Only one integration type can be added at a time',
        )
      })
  })

  describe('list', () => {
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
})
