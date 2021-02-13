/* eslint-disable max-nested-callbacks */
import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('triggers', () => {
  describe('list', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/triggers').reply(200, { list: [] }),
      )
      .command(['triggers:list'])
      .exit(0)
      .it('gives message if no trigger', (ctx) => {
        expect(ctx.stdout).to.contain(
          "you don't have a trigger currently, create one with: mailscript triggers:add",
        )
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/triggers').reply(200, { list: [{ id: 'dR862asdfgh' }] }),
      )
      .command(['triggers:list'])
      .it('lists triggers by id', (ctx) => {
        expect(ctx.stdout).to.contain('dR862asdfgh')
      })
  })

  describe('add', () => {
    let postBody: any

    beforeEach(() => {
      postBody = {}
    })

    const nockAdd = (api: any) => {
      return api
        .post('/triggers', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'trigger-xxx-yyy-zzz' })
    }

    test
      .stdout()
      .command(['triggers:add'])
      .exit(2)
      .it('fails if no name provided')

    describe('triggers', () => {
      describe('time based', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--times',
            '5',
            '--seconds',
            '50',
            '--domain',
            'github.com',
          ])
          .it('adds trigger on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              times: {
                thisManySeconds: 50,
                thisManyTimes: 5,
              },
              criteria: {
                domain: 'github.com',
              },
            })
          })

        test
          .stdout()
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--domain',
            'example.com',
            '--times',
            '5',
          ])
          .exit(1)
          .it('errors if times provided but not seconds', (ctx) => {
            expect(ctx.stdout).to.contain(
              'Flag --seconds required when using --times',
            )
          })

        test
          .stdout()
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--domain',
            'example.com',
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
            'triggers:add',
            '--name',
            'trigger-01',
            '--from',
            'smith@example.com',
          ])
          .it('adds trigger on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              criteria: {
                from: 'smith@example.com',
              },
            })
          })
      })

      describe('sentto', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--sentto',
            'test+spam@mailscript.io',
          ])
          .it('adds trigger on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              criteria: {
                sentTo: 'test+spam@mailscript.io',
              },
            })
          })
      })

      describe('subjectContains', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--subjectcontains',
            'alert',
          ])
          .it('adds trigger on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              criteria: {
                subjectContains: 'alert',
              },
            })
          })
      })

      describe('domain', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--domain',
            'example.com',
          ])
          .it('adds trigger on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              criteria: {
                domain: 'example.com',
              },
            })
          })
      })

      describe('hasTheWords', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--hasthewords',
            'alert',
          ])
          .it('adds trigger on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              criteria: {
                hasTheWords: 'alert',
              },
            })
          })
      })

      describe('hasAttachments', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command(['triggers:add', '--name', 'trigger-01', '--hasattachments'])
          .it('adds trigger on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              criteria: {
                hasAttachments: true,
              },
            })
          })
      })

      describe('property', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--property',
            'metadata.github.org',
            '--equals',
            'mailscript',
          ])
          .it('adds trigger on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              criteria: {
                'metadata.github.org': 'mailscript',
              },
            })
          })

        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--property',
            'github.pr.number',
            '--equals',
            '5',
          ])
          .it('adds number properties', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              criteria: {
                'github.pr.number': 5,
              },
            })
          })

        test
          .stdout()
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--property',
            'metadata.github.org',
          ])
          .exit(1)
          .it('errors on missing equals', (ctx) => {
            expect(ctx.stdout).to.contain('Flag --property requires --equals')
          })

        test
          .stdout()
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--equals',
            'mailscript',
          ])
          .exit(1)
          .it('errors on missing property', (ctx) => {
            expect(ctx.stdout).to.contain(
              'Flag --equals requires to be used with --property',
            )
          })
      })

      describe('firstTimeSender', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--firsttimesender',
          ])
          .it('adds trigger on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              criteria: {
                firstTimeSender: true,
              },
            })
          })
      })

      describe('all', () => {
        test
          .stdout()
          .nock(MailscriptApiServer, nockAdd)
          .command([
            'triggers:add',
            '--name',
            'trigger-01',
            '--from',
            'smith@example.com',
            '--sentto',
            'test+spam@mailscript.io',
            '--subjectcontains',
            'a subject',
            '--domain',
            'example.com',
            '--hasthewords',
            'alert',
            '--hasattachments',
            '--firsttimesender',
          ])
          .it('adds trigger on the server', (ctx) => {
            expect(ctx.stdout).to.contain('Trigger setup: trigger-01')
            expect(postBody).to.eql({
              name: 'trigger-01',
              criteria: {
                domain: 'example.com',
                from: 'smith@example.com',
                sentTo: 'test+spam@mailscript.io',
                hasAttachments: true,
                hasTheWords: 'alert',
                subjectContains: 'a subject',
                firstTimeSender: true,
              },
            })
          })
      })
    })
  })

  describe('delete', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) => {
        return api.delete('/triggers/trigger-01-xxx-yyy-zzz').reply(204)
      })
      .command(['triggers:delete', '--trigger', 'trigger-01-xxx-yyy-zzz'])
      .it('deletes trigger on the server', (ctx) => {
        expect(ctx.stdout).to.contain('Trigger deleted: trigger-01-xxx-yyy-zzz')
      })

    test
      .stdout()
      .command(['triggers:delete'])
      .exit(2)
      .it('errors if no trigger id provided')
  })
})
