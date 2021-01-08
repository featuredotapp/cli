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

    const nockCheckOutput = (api: any) => {
      return api.get('/outputs?name=output-email-01').reply(200, {
        list: [
          {
            id: 'output-01-xxx-yyy-zzz',
            name: 'output-email-01',
            type: 'mailscript-email',
          },
        ],
      })
    }

    const nockAddEmail = (api: any) => {
      return api
        .get('/outputs?name=output-email-01')
        .reply(200, {
          list: [
            {
              id: 'output-01-xxx-yyy-zzz',
              name: 'output-email-01',
              type: 'mailscript-email',
            },
          ],
        })
        .post('/actions', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'trigger-xxx-yyy-zzz' })
    }

    beforeEach(() => {
      postBody = {}
    })

    describe('forward', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddEmail)
        .command([
          'actions:add',
          '--name',
          'forward-01',
          '--output',
          'output-email-01',
          '--forward',
          'example@example.com',
        ])
        .it('succeeds on valid forward', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: forward-01')

          expect(postBody).to.eql({
            name: 'forward-01',
            output: 'output-01-xxx-yyy-zzz',
            config: {
              forward: 'example@example.com',
              type: 'forward',
            },
          })
        })
    })

    describe('send', () => {
      test
        .stdout()
        .nock(MailscriptApiServer, nockAddEmail)
        .command([
          'actions:add',
          '--name',
          'send-01',
          '--output',
          'output-email-01',
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
            output: 'output-01-xxx-yyy-zzz',
            config: {
              type: 'send',
              send: 'example@example.com',
              subject: 'a subject',
              text: 'Some text',
            },
          })
        })

      test
        .stdout()
        .nock(MailscriptApiServer, nockCheckOutput)
        .command([
          'actions:add',
          '--name',
          'send-01',
          '--output',
          'output-email-01',
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
        .nock(MailscriptApiServer, nockCheckOutput)
        .command([
          'actions:add',
          '--name',
          'send-01',
          '--output',
          'output-email-01',
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
        .nock(MailscriptApiServer, nockAddEmail)
        .command([
          'actions:add',
          '--name',
          'reply-01',
          '--output',
          'output-email-01',
          '--reply',
          '--text',
          'Some text',
        ])
        .it('succeeds on valid reply', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: reply-01')

          expect(postBody).to.eql({
            name: 'reply-01',
            output: 'output-01-xxx-yyy-zzz',
            config: {
              type: 'reply',
              text: 'Some text',
            },
          })
        })

      test
        .stdout()
        .nock(MailscriptApiServer, nockCheckOutput)
        .command([
          'actions:add',
          '--name',
          'send-01',
          '--output',
          'output-email-01',
          '--reply',
        ])
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
        .nock(MailscriptApiServer, nockAddEmail)
        .command([
          'actions:add',
          '--name',
          'replyall-01',
          '--output',
          'output-email-01',
          '--replyall',
          '--text',
          'Some text',
        ])
        .it('succeeds on valid reply', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: replyall-01')

          expect(postBody).to.eql({
            name: 'replyall-01',
            output: 'output-01-xxx-yyy-zzz',
            config: {
              type: 'replyAll',
              text: 'Some text',
            },
          })
        })

      test
        .stdout()
        .nock(MailscriptApiServer, nockCheckOutput)
        .command([
          'actions:add',
          '--name',
          'send-01',
          '--output',
          'output-email-01',
          '--reply',
        ])
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
        .nock(MailscriptApiServer, nockAddEmail)
        .command([
          'actions:add',
          '--name',
          'alias-01',
          '--output',
          'output-email-01',
          '--alias',
          'example@example.com',
        ])
        .it('succeeds on valid alias', (ctx) => {
          expect(ctx.stdout).to.contain('Action setup: alias-01')

          expect(postBody).to.eql({
            name: 'alias-01',
            output: 'output-01-xxx-yyy-zzz',
            config: {
              type: 'alias',
              alias: 'example@example.com',
            },
          })
        })

      test
        .stdout()
        .nock(MailscriptApiServer, nockCheckOutput)
        .command([
          'actions:add',
          '--name',
          'send-01',
          '--output',
          'output-email-01',
          '--reply',
        ])
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

    test
      .stdout()
      .command(['actions:add', '--name', 'example'])
      .exit(2)
      .it('fails if no output provided')
  })
})
