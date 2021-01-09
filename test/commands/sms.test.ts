import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('Actions', () => {
  describe('list', () => {
    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/sms').reply(200, { list: [] }),
      )
      .command(['sms:list'])
      .exit(0)
      .it('gives message if no sms', (ctx) => {
        expect(ctx.stdout).to.contain(
          "you don't have any sms numbers currently, create one with: mailscript sms:add",
        )
      })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api.get('/sms').reply(200, {
          list: [{ id: 'dR862asdfgh', name: 'dentist', number: '+4477633452' }],
        }),
      )
      .command(['sms:list'])
      .it('lists actions by id', (ctx) => {
        expect(ctx.stdout).to.contain('dR862asdfgh')
        expect(ctx.stdout).to.contain('dentist')
        expect(ctx.stdout).to.contain('+4477633452')
      })
  })

  describe('add', () => {
    let postBody: any

    const nockAdd = (api: any) => {
      return api
        .post('/sms', (body: any) => {
          postBody = body
          return true
        })
        .reply(201, { id: 'sms-xxx-yyy-zzz' })
    }

    beforeEach(() => {
      postBody = {}
    })

    test
      .stdout()
      .nock(MailscriptApiServer, nockAdd)
      .command(['sms:add', '--name', 'dentist', '--number', '+447765532'])
      .it('succeeds on valid add', (ctx) => {
        expect(ctx.stdout).to.contain('SMS setup: dentist')

        expect(postBody).to.eql({
          name: 'dentist',
          number: '+447765532',
        })
      })

    test.stdout().command(['sms:add']).exit(2).it('fails if no name provided')

    test
      .stdout()
      .command(['sms:add', '--name', 'example'])
      .exit(2)
      .it('fails if no number provided')
  })
})
