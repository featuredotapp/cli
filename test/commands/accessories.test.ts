import { expect, test } from '@oclif/test'

describe('Accessories', () => {
  test
    .stdout()
    .nock('http://localhost:7000', (api) =>
      api.get('/v1/accessories').reply(200, { list: [] }),
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
    .nock('http://localhost:7000', (api) =>
      api
        .get('/v1/accessories')
        .reply(200, { list: [{ name: 'test@mailscript.io' }] }),
    )
    .command(['accessories', 'list'])
    .it('lists accessories by name', (ctx) => {
      expect(ctx.stdout).to.contain('test@mailscript.io')
    })
})
