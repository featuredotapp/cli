/* eslint-disable max-nested-callbacks */
import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('workflows', () => {
  describe('list', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/workflows').reply(200, { list: [] }),
      )
      .command(['workflows:list'])
      .exit(0)
      .it('gives message if no workflows', (ctx) => {
        expect(ctx.stdout).to.contain(
          "you don't have an workflow currently, create one with: mailscript workflows:add",
        )
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/workflows').reply(200, { list: [{ id: 'dR862asdfgh' }] }),
      )
      .command(['workflows:list'])
      .it('lists workflows by id', (ctx) => {
        expect(ctx.stdout).to.contain('dR862asdfgh')
      })
  })

  describe('add', () => {
    test
      .stdout()
      .command(['workflows:add'])
      .exit(2)
      .it('fails if no name provided')

    test
      .stdout()
      .command(['workflows:add', '--name', 'workflow-01'])
      .exit(2)
      .it('fails if no input provided')

    test
      .stdout()
      .command([
        'workflows:add',
        '--name',
        'workflow-01',
        '--output',
        'output-01',
      ])
      .exit(2)
      .it('fails if no action provided')

    // Fail if output doesn't exist
    // Fail if trigger does not exist
    // Fail if action does not exist
  })

  describe('delete', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) => {
        return api.delete('/workflows/work-01-xxx-yyy-zzz').reply(204)
      })
      .command(['workflows:delete', '--workflow', 'work-01-xxx-yyy-zzz'])
      .it('deletes workflow on the server', (ctx) => {
        expect(ctx.stdout).to.contain('Workflow deleted: work-01-xxx-yyy-zzz')
      })

    test
      .stdout()
      .command(['workflows:delete'])
      .exit(2)
      .it('errors if no workflow id provided')
  })
})
