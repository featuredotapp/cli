import { expect, test } from '@oclif/test'

describe('Error handling', () => {
  test
    .stdout()
    .nock('http://localhost:7000', (api) =>
      api.get('/v1/workspaces').reply(403, { error: 'No credentials sent!' }),
    )
    .command(['workspaces', 'list'])
    .exit(1)
    .it('warns on no credentials', (ctx) => {
      expect(ctx.stdout).to.contain(
        'Error - authenticating: No credentials sent!',
      )
    })

  test
    .stdout()
    .nock('http://localhost:7000', (api) =>
      api.get('/v1/workspaces').reply(400, { error: 'bad request boo!' }),
    )
    .command(['workspaces', 'list'])
    .exit(1)
    .it('shows error for general bad request', (ctx) => {
      expect(ctx.stdout).to.contain('Error - bad request: bad request boo!')
    })

  test
    .stdout()
    .nock('http://localhost:7000', (api) =>
      api.get('/v1/workspaces').reply(777, { aaa: 'bbb' }),
    )
    .command(['workspaces', 'list'])
    .exit(1)
    .it('shows response and exits for unknown status code', (ctx) => {
      expect(ctx.stdout).to.contain('Unknown status code 777')
    })
})
