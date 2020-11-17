import { expect, test } from '@oclif/test'

describe('Automations', () => {
  test
    .stdout()
    .nock('http://localhost:7000', (api) =>
      api.get('/v1/automations').reply(200, { list: [] }),
    )
    .command(['automations', 'list'])
    .exit(0)
    .it('gives message if no automations', (ctx) => {
      expect(ctx.stdout).to.contain(
        "you don't have an automation currently, create one with: mailscript automations add",
      )
    })

  test
    .stdout()
    .nock('http://localhost:7000', (api) =>
      api.get('/v1/automations').reply(200, { list: [{ id: 'dR862asdfgh' }] }),
    )
    .command(['automations', 'list'])
    .it('lists automations by id', (ctx) => {
      expect(ctx.stdout).to.contain('dR862asdfgh')
    })
})
