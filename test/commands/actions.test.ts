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
        .nock(MailscriptApiServer, nockAddAction)
        .command([
          'actions:add',
          '--name',
          'forward-01',
          '--forward',
          'example@example.com',
        ])
        .it('succeeds on valid forward', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: forward-01')

          expect(postBody).to.eql({
            name: 'forward-01',
            type: 'forward',
            config: {
              forward: 'example@example.com',
            },
          })
        })
    })

    describe('send', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddAction)
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
        ])
        .it('succeeds on valid send', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: send-01')

          expect(postBody).to.eql({
            name: 'send-01',
            type: 'send',
            config: {
              send: 'example@example.com',
              subject: 'a subject',
              text: 'Some text',
            },
          })
        })

      test
        .stdout()
        // .nock(MailscriptApiServer, nockCheckOutput)
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
        // .nock(MailscriptApiServer, nockCheckOutput)
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
        .nock(MailscriptApiServer, nockAddAction)
        .command([
          'actions:add',
          '--name',
          'reply-01',
          '--reply',
          '--text',
          'Some text',
        ])
        .it('succeeds on valid reply', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: reply-01')

          expect(postBody).to.eql({
            name: 'reply-01',
            type: 'reply',
            config: {
              text: 'Some text',
            },
          })
        })

      test
        .stdout()
        // .nock(MailscriptApiServer, nockCheckOutput)
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
        .nock(MailscriptApiServer, nockAddAction)
        .command([
          'actions:add',
          '--name',
          'replyall-01',
          '--replyall',
          '--text',
          'Some text',
        ])
        .it('succeeds on valid reply all', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: replyall-01')

          expect(postBody).to.eql({
            name: 'replyall-01',
            type: 'replyAll',
            config: {
              text: 'Some text',
            },
          })
        })

      test
        .stdout()
        // .nock(MailscriptApiServer, nockCheckOutput)
        .command(['actions:add', '--name', 'send-01', '--reply'])
        .exit(1)
        .it('errors on no text or html', (ctx) => {
          expect(ctx.stdout).to.contain(
            'Please provide either --text or --html',
          )
        })
    })

    describe.skip('alias', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddAction)
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
            config: {
              type: 'alias',
              alias: 'example@example.com',
            },
          })
        })

      test
        .stdout()
        // .nock(MailscriptApiServer, nockCheckOutput)
        .command(['actions:add', '--name', 'send-01', '--reply'])
        .exit(1)
        .it('errors on no text or html', (ctx) => {
          expect(ctx.stdout).to.contain(
            'Please provide either --text or --html',
          )
        })
    })

    test
      .stdout()
      .command(['actions:add'])
      .exit(2)
      .it('fails if no name provided')
  })
})
