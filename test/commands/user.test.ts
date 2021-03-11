import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('User', () => {
  describe('update', () => {
    let userBody: {} | undefined

    beforeEach(() => {
      userBody = undefined
    })

    test
      .stdout()
      .nock(MailscriptApiServer, (api) =>
        api
          .put('/user', (body: any) => {
            userBody = body
            return true
          })
          .reply(200),
      )
      .command(['user:update', '--displayname', 'A display name'])
      .it('adds address', (ctx) => {
        expect(ctx.stdout).to.contain('User updated')

        expect(userBody).to.eql({ displayName: 'A display name' })
      })

    test
      .stdout()
      .command(['user:update'])
      .exit(2)
      .it('errors on no display name')
  })
})
