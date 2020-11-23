/* eslint-disable max-nested-callbacks */
import { expect, test } from '@oclif/test'

describe('Automations', () => {
  describe('list', () => {
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
        api
          .get('/v1/automations')
          .reply(200, { list: [{ id: 'dR862asdfgh' }] }),
      )
      .command(['automations', 'list'])
      .it('lists automations by id', (ctx) => {
        expect(ctx.stdout).to.contain('dR862asdfgh')
      })
  })

  describe('add', () => {
    let postBody: any

    beforeEach(() => {
      postBody = {}
    })

    const nockAdd = (api: any) => {
      api
        .persist()
        .get('/v1/accessories')
        .query({ name: 'test@mailscript.io' })
        .reply(200, {
          id: 'access-01-xxx-yyy-zzz',
          name: 'test@mailscript.io',
        })

      api.persist().get('/v1/accessories/test@mailscript.io').reply(200, {
        id: 'access-01-xxx-yyy-zzz',
        name: 'test@mailscript.io',
      })

      return api
        .post('/v1/automations', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'auto-xxx-yyy-zzz' })
    }

    describe('forward', () => {
      test
        .stdout()
        .nock('http://localhost:7000', nockAdd)
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
        .nock('http://localhost:7000', nockAdd)
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
        .nock('http://localhost:7000', nockAdd)
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
        .nock('http://localhost:7000', nockAdd)
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
        .nock('http://localhost:7000', nockAdd)
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
        .nock('http://localhost:7000', nockAdd)
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
        .nock('http://localhost:7000', nockAdd)
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
          expect(postBody.actions[0].config).to.eql({
            type: 'webhook',
            url: 'http://example.com/webhook',
            opts: {
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'POST',
            },
            body: {},
          })
        })
    })

    describe('multiple types', () => {
      test
        .stdout()
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
