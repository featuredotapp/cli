import { expect, test } from '@oclif/test'

describe('Workspaces', () => {
  test
    .stdout()
    .nock('http://localhost:7000', (api) =>
      api.get('/v1/workspaces').reply(200, { list: [] }),
    )
    .command(['workspaces', 'list'])
    .exit(0)
    .it('gives message if no workspaces', (ctx) => {
      expect(ctx.stdout).to.contain(
        "you don't have a workspace currently, create one with: mailscript workspaces add",
      )
    })

  test
    .stdout()
    .nock('http://localhost:7000', (api) =>
      api.get('/v1/workspaces').reply(200, { list: [{ id: 'test' }] }),
    )
    .command(['workspaces', 'list'])
    .it('lists workspaces by ids (name)', (ctx) => {
      expect(ctx.stdout).to.contain('test')
    })
})
