import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('Usernames', () => {
  test
    .stdout()
    .nock(MailscriptApiServer, (api) =>
      api.get('/workspaces').reply(200, { list: [] }),
    )
    .command(['usernames', 'list'])
    .exit(0)
    .it('gives message if no usernames', (ctx) => {
      expect(ctx.stdout).to.contain(
        "you don't have a username currently, create one with: mailscript usernames add",
      )
    })

  test
    .stdout()
    .nock(MailscriptApiServer, (api) =>
      api.get('/workspaces').reply(200, { list: [{ id: 'test' }] }),
    )
    .command(['usernames', 'list'])
    .it('lists usernames by ids (name)', (ctx) => {
      expect(ctx.stdout).to.contain('test')
    })
})
