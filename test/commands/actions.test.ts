import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('Actions', () => {
  describe('list', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/actions').reply(200, { list: [] }),
      )
      .command(['actions:list'])
      .exit(0)
      .it('gives message if no action', (ctx) => {
        expect(ctx.stdout).to.contain(
          "you don't have an action currently, create one with: mailscript actions:add",
        )
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/actions').reply(200, { list: [{ id: 'dR862asdfgh' }] }),
      )
      .command(['actions:list'])
      .it('lists actions by id', (ctx) => {
        expect(ctx.stdout).to.contain('dR862asdfgh')
      })
  })

  describe('add', () => {
    let postBody: any

    const nockAddAction = (api: any) => {
      return api
        .post('/actions', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'action-xxx-yyy-zzz' })
    }

    const nockAddAliasAction = (api: any) => {
      return api
        .get('/user')
        .reply(200, { id: 'xyz', email: 'example@example.com' })
        .post('/actions', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'action-xxx-yyy-zzz' })
    }

    const nockAddMailscriptEmailAction = (api: any) => {
      return api
        .get('/addresses')
        .reply(200, { list: [{ id: 'smith@mailscript.com' }] })
        .get('/addresses/smith@mailscript.com/keys')
        .reply(200, { list: [{ id: 'key-01-xxx', write: true, read: true }] })
        .post('/actions', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'action-xxx-yyy-zzz' })
    }

    const nockAddSmsAction = (api: any) => {
      return api
        .get('/verifications')
        .reply(200, {
          list: [{ verified: true, type: 'sms', sms: '+448871123' }],
        })
        .post('/actions', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'action-xxx-yyy-zzz' })
    }

    beforeEach(() => {
      postBody = {}
    })

    describe('gdrive', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddAction)
        .command([
          'actions:add',
          '--name',
          'gdrive-01',
          '--gdrive',
          'path',
        ])
        .it('succeeds on valid gdrive', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: gdrive-01')

          const method = 'POST'

          const body = JSON.stringify({
            attachments: "{{msg.attachments}}",
            driveStoragePath: 'path',
            googleDriveAuth: "{{integrations.google}}",
          })

          const headers = {
            'Content-Type': 'application/json',
          }

          expect(postBody).to.eql({
            name: 'gdrive-01',
            type: 'webhook',
            config: {
              url: 'https://us-central1-mailscript-firebase.cloudfunctions.net/googleDrivePdfUploader',
              opts: {
                headers,
                method,
              },
              body,
            },
          })
        })
    })

    describe('sms', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddSmsAction)
        .command([
          'actions:add',
          '--name',
          'sms-01',
          '--sms',
          '+448871123',
          '--text',
          '{{subject}}',
        ])
        .it('succeeds on valid sms', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: sms-01')

          expect(postBody).to.eql({
            name: 'sms-01',
            type: 'sms',
            config: {
              number: '+448871123',
              text: '{{subject}}',
            },
          })
        })
    })

    describe('webhook', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddAction)
        .command([
          'actions:add',
          '--name',
          'webhook-01',
          '--webhook',
          'https://example.webhook/endpoint',
        ])
        .it('succeeds on valid webhook', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: webhook-01')

          expect(postBody).to.eql({
            name: 'webhook-01',
            type: 'webhook',
            config: {
              url: 'https://example.webhook/endpoint',
              body: '',
              opts: {
                headers: {
                  'Content-Type': 'application/json',
                },
                method: 'POST',
              },
            },
          })
        })
    })

    describe('forward', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddMailscriptEmailAction)
        .command([
          'actions:add',
          '--name',
          'forward-01',
          '--forward',
          'example@example.com',
          '--from',
          'smith@mailscript.com',
        ])
        .it('succeeds on valid forward', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: forward-01')

          expect(postBody).to.eql({
            name: 'forward-01',
            type: 'mailscript-email',
            config: {
              type: 'forward',
              forward: 'example@example.com',
              from: 'smith@mailscript.com',
              key: 'key-01-xxx',
            },
          })
        })
    })

    describe('send', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddMailscriptEmailAction)
        .command([
          'actions:add',
          '--name',
          'send-01',
          '--send',
          'example@example.com',
          '--subject',
          'a subject',
          '--text',
          'Some text',
          '--from',
          'smith@mailscript.com',
        ])
        .it('succeeds on valid send', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: send-01')

          expect(postBody).to.eql({
            name: 'send-01',
            type: 'mailscript-email',
            config: {
              type: 'send',
              to: 'example@example.com',
              subject: 'a subject',
              text: 'Some text',
              from: 'smith@mailscript.com',
              key: 'key-01-xxx',
            },
          })
        })

      test
        .stdout()
        .command([
          'actions:add',
          '--name',
          'send-01',
          '--send',
          'example@example.com',
          '--text',
          'Some text',
        ])
        .exit(1)
        .it('errors on no subject', (ctx) => {
          expect(ctx.stdout).to.contain('Please provide --subject')
        })

      test
        .stdout()
        .command([
          'actions:add',
          '--name',
          'send-01',
          '--send',
          'example@example.com',
          '--subject',
          'A subject',
        ])
        .exit(1)
        .it('errors on no text or html', (ctx) => {
          expect(ctx.stdout).to.contain(
            'Please provide either --text or --html',
          )
        })
    })

    describe('reply', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddMailscriptEmailAction)
        .command([
          'actions:add',
          '--name',
          'reply-01',
          '--reply',
          '--text',
          'Some text',
          '--from',
          'smith@mailscript.com',
        ])
        .it('succeeds on valid reply', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: reply-01')

          expect(postBody).to.eql({
            name: 'reply-01',
            type: 'mailscript-email',
            config: {
              type: 'reply',
              text: 'Some text',
              from: 'smith@mailscript.com',
              key: 'key-01-xxx',
            },
          })
        })

      test
        .stdout()
        .command(['actions:add', '--name', 'send-01', '--reply'])
        .exit(1)
        .it('errors on no text or html', (ctx) => {
          expect(ctx.stdout).to.contain(
            'Please provide either --text or --html',
          )
        })
    })

    describe('reply all', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddMailscriptEmailAction)
        .command([
          'actions:add',
          '--name',
          'replyall-01',
          '--replyall',
          '--text',
          'Some text',
          '--from',
          'smith@mailscript.com',
        ])
        .it('succeeds on valid reply all', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: replyall-01')

          expect(postBody).to.eql({
            name: 'replyall-01',
            type: 'mailscript-email',
            config: {
              from: 'smith@mailscript.com',
              key: 'key-01-xxx',
              type: 'replyAll',
              text: 'Some text',
            },
          })
        })

      test
        .stdout()
        .command(['actions:add', '--name', 'send-01', '--reply'])
        .exit(1)
        .it('errors on no text or html', (ctx) => {
          expect(ctx.stdout).to.contain(
            'Please provide either --text or --html',
          )
        })
    })

    describe('alias', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddAliasAction)
        .command([
          'actions:add',
          '--name',
          'alias-01',
          '--alias',
          'example@example.com',
        ])
        .it('succeeds on valid alias', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: alias-01')

          expect(postBody).to.eql({
            name: 'alias-01',
            type: 'mailscript-email',
            config: {
              type: 'alias',
              alias: 'example@example.com',
            },
          })
        })
    })

    test
      .stdout()
      .command(['actions:add'])
      .exit(2)
      .it('fails if no name provided')
  })

  describe('combine', () => {
    describe('combine', () => {
      let postBody: any

      const nockLookup = (api: any) => {
        return api.get('/actions').reply(200, {
          list: [
            { id: 'action-01-xxx', name: 'action-01' },
            { id: 'action-02-xxx', name: 'action-02' },
          ],
        })
      }

      const nockAddAction = (api: any) => {
        return api
          .get('/actions')
          .reply(200, {
            list: [
              { id: 'action-01-xxx', name: 'action-01' },
              { id: 'action-02-xxx', name: 'action-02' },
            ],
          })
          .post('/actions', (body: any) => {
            postBody = body
            return true
          })
          .reply(201, { id: 'action-xxx-yyy-zzz' })
      }

      test
        .stdout()
        .nock(MailscriptApiServer, nockAddAction)
        .command([
          'actions:combine',
          '--name',
          'combine-01',
          '--action',
          'action-01',
          '--action',
          'action-02',
        ])
        .it('succeeds on valid combine', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: combine-01')

          expect(postBody).to.eql({
            name: 'combine-01',
            list: ['action-01-xxx', 'action-02-xxx'],
          })
        })

      test
        .stdout()
        .command([
          'actions:combine',
          '--action',
          'action-01',
          '--action',
          'action-02',
        ])
        .exit(2)
        .it('error if no name given')

      test
        .stdout()
        .command(['actions:combine', '--name', 'combine-01'])
        .exit(2)
        .it('error if no actions given')

      test
        .stdout()
        .command([
          'actions:combine',
          '--name',
          'combine-01',
          '--action',
          'action-01',
        ])
        .exit(1)
        .it('errors on less than 2 actions for combination', (ctx) => {
          expect(ctx.stdout).to.contain('At least two actions must be combined')
        })

      test
        .stdout()
        .nock(MailscriptApiServer, nockLookup)
        .command([
          'actions:combine',
          '--name',
          'combine-01',
          '--action',
          'action-01',
          '--action',
          'unknown',
        ])
        .exit(1)
        .it('errors on unknown action', (ctx) => {
          expect(ctx.stdout).to.contain('Could not find action unknown')
        })
    })
  })

  describe('delete', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) => {
        return api.delete('/actions/action-01-xxx-yyy-zzz').reply(204)
      })
      .command(['actions:delete', '--action', 'action-01-xxx-yyy-zzz'])
      .it('deletes workflow on the server', (ctx) => {
        expect(ctx.stdout).to.contain('Action deleted: action-01-xxx-yyy-zzz')
      })

    test
      .stdout()
      .command(['actions:delete'])
      .exit(2)
      .it('errors if no workflow id provided')
  })
})
