import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('send', () => {
  let postBody: any

  beforeEach(() => {
    postBody = {}
  })

  const nockSend = (api: any) => {
    return api
      .persist()
      .post('/send', (body: any) => {
        postBody = body
        return true
      })
      .reply(200, {
        sent: true,
      })
  }

  test
    .stdout()
    .nock(MailscriptApiServer, nockSend)
    .command([
      'send',
      '--to',
      'smith@example.com',
      '--from',
      'test@mailscript.io',
      '--subject',
      'A test email',
      '--text',
      'The body of the test email',
    ])
    .it('email with text body', (ctx) => {
      expect(ctx.stdout).to.contain('Email sent')
      expect(postBody).to.eql({
        from: 'test@mailscript.io',
        subject: 'A test email',
        text: 'The body of the test email',
        to: 'smith@example.com',
      })
    })
})
