import { expect, test } from '@oclif/test'

describe('Addresses', () => {
  test
    .stdout()
    .nock('http://localhost:7000', (api) =>
      api.get('/v1/addresses').reply(200, { list: [] }),
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
    .nock('http://localhost:7000', (api) =>
      api
        .get('/v1/addresses')
        .reply(200, { list: [{ id: 'test@mailscript.io' }] }),
    )
    .command(['addresses', 'list'])
    .it('lists addresses by id', (ctx) => {
      expect(ctx.stdout).to.contain('test@mailscript.io')
    })
})
