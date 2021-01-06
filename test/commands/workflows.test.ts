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
    let postBody: any

    beforeEach(() => {
      postBody = {}
    })

    const nockRead = (api: any) => {
      return api
        .persist()
        .get('/accessories')
        .reply(200, {
          list: [
            {
              id: 'access-01-xxx-yyy-zzz',
              name: 'test@mailscript.io',
              type: 'mailscript-email',
            },
            {
              id: 'webhook-xyz',
              name: 'webhook',
              type: 'mailscript-email',
            },
            {
              id: 'access-03-xxx-yyy-zzz',
              name: 'test-sms',
              type: 'sms',
              sms: '+7766767556',
            },
          ],
        })
    }

    const nockAdd = (api: any) => {
      api
        .persist()
        .get('/accessories')
        .reply(200, {
          list: [
            {
              id: 'access-01-xxx-yyy-zzz',
              name: 'test@mailscript.io',
              type: 'mailscript-email',
              address: 'test@mailscript.io',
            },
            {
              id: 'webhook-xyz',
              name: 'webhook',
              type: 'mailscript-email',
            },
            {
              id: 'access-03-xxx-yyy-zzz',
              name: 'test-sms',
              type: 'sms',
              sms: '+7766767556',
            },
            {
              id: 'daemon-xyz',
              name: 'laptop',
              type: 'daemon',
            },
          ],
        })

      return api
        .post('/workflows', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'auto-xxx-yyy-zzz' })
    }

    const nockAddAlias = (api: any) => {
      api
        .persist()
        .get('/accessories')
        .reply(200, {
          list: [
            {
              id: 'access-01-xxx-yyy-zzz',
              name: 'test@mailscript.io',
              type: 'mailscript-email',
              address: 'test@mailscript.io',
            },
            {
              id: 'webhook-xyz',
              name: 'webhook',
              type: 'mailscript-email',
            },
            {
              id: 'access-03-xxx-yyy-zzz',
              name: 'test-sms',
              type: 'sms',
              sms: '+7766767556',
            },
          ],
        })
        .get('/user')
        .reply(200, { email: 'smith@example.com' })

      return api
        .post('/workflows', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'auto-xxx-yyy-zzz' })
    }

    const nockAddFromVerificationsList = (api: any) => {
      api
        .persist()
        .get('/accessories')
        .reply(200, {
          list: [
            {
              id: 'access-01-xxx-yyy-zzz',
              name: 'test@mailscript.io',
              type: 'mailscript-email',
              address: 'test@mailscript.io',
            },
            {
              id: 'webhook-xyz',
              name: 'webhook',
              type: 'mailscript-email',
            },
            {
              id: 'access-03-xxx-yyy-zzz',
              name: 'test-sms',
              type: 'sms',
              sms: '+7766767556',
            },
          ],
        })
        .get('/user')
        .reply(200, { email: 'smith@example.com' })
        .get('/verifications')
        .reply(200, {
          list: [
            { type: 'email', email: 'another@example.com', verified: true },
          ],
        })

      return api
        .post('/workflows', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'auto-xxx-yyy-zzz' })
    }

    const nockAddMailscriptAddress = (api: any) => {
      api
        .persist()
        .get('/accessories')
        .reply(200, {
          list: [
            {
              id: 'access-01-xxx-yyy-zzz',
              name: 'test@mailscript.io',
              type: 'mailscript-email',
              address: 'test@mailscript.io',
            },
            {
              id: 'access-07-xxx-yyy-zzz',
              name: 'xyz@mailscript.io',
              type: 'mailscript-email',
              address: 'test@mailscript.io',
              key: 'key-01-xxx-yyy-zzz',
            },
          ],
        })
        .get('/user')
        .reply(200, { email: 'smith@example.com' })
        .get('/addresses/test@mailscript.io/keys/key-01-xxx-yyy-zzz')
        .reply(200, { write: true })

      return api
        .post('/workflows', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'access-07-xxx-yyy-zzz' })
    }

    const nockAddUnverified = (api: any) => {
      return api
        .persist()
        .get('/accessories')
        .reply(200, {
          list: [
            {
              id: 'access-01-xxx-yyy-zzz',
              name: 'test@mailscript.io',
              type: 'mailscript-email',
              address: 'test@mailscript.io',
            },
            {
              id: 'webhook-xyz',
              name: 'webhook',
              type: 'mailscript-email',
            },
            {
              id: 'access-03-xxx-yyy-zzz',
              name: 'test-sms',
              type: 'sms',
              sms: '+7766767556',
            },
          ],
        })
        .get('/user')
        .reply(200, { email: 'smith@example.com' })
        .get('/verifications')
        .reply(200, {
          list: [
            { type: 'email', email: 'another@example.com', verified: true },
          ],
        })
    }

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
