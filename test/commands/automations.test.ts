/* eslint-disable max-nested-callbacks */
import { expect, test } from '@oclif/test'
import { exit } from 'process'
import { MailscriptApiServer } from './constants'

describe('Automations', () => {
  describe('list', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/automations').reply(200, { list: [] }),
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
      .nock(MailscriptApiServer, (api) =>
        api.get('/automations').reply(200, { list: [{ id: 'dR862asdfgh' }] }),
      )
      .command(['automations', 'list'])
      .it('lists automations by id', (ctx) => {
        expect(ctx.stdout).to.contain('dR862asdfgh')
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/automations').reply(200, { list: [{ id: 'dR862asdfgh' }] }),
      )
      .command(['automations'])
      .it('defaults to list', (ctx) => {
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
          ],
        })

      return api
        .post('/automations', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'auto-xxx-yyy-zzz' })
    }

    describe('triggers', () => {
      describe('time based', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
            '--times',
            '5',
            '--seconds',
            '50',
          ])
          .it('adds automation on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Automation setup: auto-xxx-yyy-zzz')
            expect(postBody.trigger.config).to.eql({
              criterias: [
                {
                  sentTo: 'test@mailscript.io',
                },
              ],
              times: {
                thisManySeconds: 50,
                thisManyTimes: 5,
              },
            })
          })

        test
          .stdout()
          .nock(MailscriptApiServer, nockRead)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
            '--times',
            '5',
          ])
          .exit(1)
          .it('errors if times proved but not seconds', (ctx) => {
            expect(ctx.stdout).to.contain(
              'Flag --seconds required when using --times',
            )
          })

        test
          .stdout()
          .nock(MailscriptApiServer, nockRead)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
            '--seconds',
            '120',
          ])
          .exit(1)
          .it('errors if seconds provided but not times', (ctx) => {
            expect(ctx.stdout).to.contain(
              'Flag --times required when using --seconds',
            )
          })
      })

      describe('from', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
            '--from',
            'smith@example.com',
          ])
          .it('adds automation on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Automation setup: auto-xxx-yyy-zzz')
            expect(postBody.trigger.config).to.eql({
              criterias: [
                {
                  from: 'smith@example.com',
                },
              ],
            })
          })
      })

      describe('subjectContains', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
            '--subjectcontains',
            'alert',
          ])
          .it('adds automation on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Automation setup: auto-xxx-yyy-zzz')
            expect(postBody.trigger.config).to.eql({
              criterias: [
                {
                  subjectContains: 'alert',
                },
              ],
            })
          })
      })

      describe('domain', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
            '--domain',
            'example.com',
          ])
          .it('adds automation on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Automation setup: auto-xxx-yyy-zzz')
            expect(postBody.trigger.config).to.eql({
              criterias: [
                {
                  domain: 'example.com',
                },
              ],
            })
          })
      })

      describe('hasTheWords', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
            '--hasthewords',
            'alert',
          ])
          .it('adds automation on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Automation setup: auto-xxx-yyy-zzz')
            expect(postBody.trigger.config).to.eql({
              criterias: [
                {
                  hasTheWords: 'alert',
                },
              ],
            })
          })
      })

      describe('hasAttachments', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
            '--hasattachments',
          ])
          .it('adds automation on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Automation setup: auto-xxx-yyy-zzz')
            expect(postBody.trigger.config).to.eql({
              criterias: [
                {
                  hasAttachments: true,
                },
              ],
            })
          })
      })

      describe('all', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
            '--from',
            'smith@example.com',
            '--subjectcontains',
            'a subject',
            '--domain',
            'example.com',
            '--hasthewords',
            'alert',
            '--hasattachments',
          ])
          .it('adds automation on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Automation setup: auto-xxx-yyy-zzz')
            expect(postBody.trigger.config).to.eql({
              criterias: [
                {
                  domain: 'example.com',
                  from: 'smith@example.com',
                  hasAttachments: true,
                  hasTheWords: 'alert',
                  subjectContains: 'a subject',
                },
              ],
            })
          })
      })
    })

    describe('types', () => {
      describe('forward', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--action',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
          ])
          .it('add forward automation', (ctx) => {
            expect(ctx.stdout).to.contain('auto-xxx-yyy-zzz')
            expect(postBody.actions[0].config).to.eql({
              type: 'forward',
              forward: 'another@example.com',
            })
          })

        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--forward',
            'another@example.com',
          ])
          .it('defaults action to trigger if none provided', (ctx) => {
            expect(ctx.stdout).to.contain('auto-xxx-yyy-zzz')
          })
      })

      describe('send', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--send',
            'another@example.com',
            '--subject',
            'subject',
            '--text',
            'text',
          ])
          .it('add send automation', (ctx) => {
            expect(ctx.stdout).to.contain('auto-xxx-yyy-zzz')
            expect(postBody.actions[0].config).to.eql({
              subject: 'subject',
              text: 'text',
              to: 'another@example.com',
              type: 'send',
            })
          })
      })

      describe('reply', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--reply',
            '--text',
            'text',
          ])
          .it('add reply automation', (ctx) => {
            expect(ctx.stdout).to.contain('auto-xxx-yyy-zzz')
            expect(postBody.actions[0].config).to.eql({
              type: 'reply',
              text: 'text',
            })
          })
      })

      describe('reply all', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--replyall',
            '--text',
            'text',
          ])
          .it('add reply all automation', (ctx) => {
            expect(ctx.stdout).to.contain('auto-xxx-yyy-zzz')
            expect(postBody.actions[0].config).to.eql({
              type: 'replyAll',
              text: 'text',
            })
          })
      })

      describe('alias', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--alias',
            'another@mailscript.io',
            '--text',
            'text',
          ])
          .it('add reply all automation', (ctx) => {
            expect(ctx.stdout).to.contain('auto-xxx-yyy-zzz')
            expect(postBody.actions[0].config).to.eql({
              type: 'alias',
              alias: 'another@mailscript.io',
            })
          })
      })

      describe('webhook', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--webhook',
            'http://example.com/webhook',
          ])
          .it('add webhook automation', (ctx) => {
            expect(ctx.stdout).to.contain('auto-xxx-yyy-zzz')
            expect(postBody.actions[0].accessoryId.startsWith('webhook-'))
            expect(postBody.actions[0].config).to.eql({
              type: 'webhook',
              url: 'http://example.com/webhook',
              opts: {
                headers: {
                  'Content-Type': 'application/json',
                },
                method: 'POST',
              },
              body: '',
            })
          })
      })

      describe('sms', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--action',
            'test-sms',
            '--text',
            'from mailscript - {{subject}}',
          ])
          .it('add sms automation', (ctx) => {
            expect(ctx.stdout).to.contain('auto-xxx-yyy-zzz')
            expect(postBody.actions[0].accessoryId).to.eql(
              'access-03-xxx-yyy-zzz',
            )
            expect(postBody.actions[0].config).to.eql({
              type: 'sms',
              text: 'from mailscript - {{subject}}',
            })
          })
      })

      describe('multiple types', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockRead)
          .command([
            'automations',
            'add',
            '--trigger',
            'test@mailscript.io',
            '--alias',
            'another@mailscript.io',
            '--send',
            'another@mailscript.io',
            '--text',
            'text',
          ])
          .exit(1)
          .it('it errors', (ctx) => {
            expect(ctx.stdout).to.contain('Please provide one type flag either')
          })
      })
    })
  })
})
