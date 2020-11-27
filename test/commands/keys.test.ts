import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('keys', () => {
  describe('list', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/addresses/test@example.com/keys').reply(200, { list: [] }),
      )
      .command(['keys', 'list', '--address', 'test@example.com'])
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
      .command(['keys', 'list', '--address', 'test@example.com'])
      .it('lists keys by ids', (ctx) => {
        expect(ctx.stdout).to.contain(
          `
Keys for test@example.com

Id        Read  Write 
xxxUUUPPP false true`,
        )
      })
  })
})
