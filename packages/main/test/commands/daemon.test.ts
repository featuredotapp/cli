import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'
// const spigot = require('stream-spigot')
process.env.MAILSCRIPT_DAEMON_BRIDGE_URL = 'wss://daemon-bridge.com:80'

describe('daemon', () => {
  // test
  //   .stdout()
  //   .nock(MailscriptApiServer, (api: any) => {
  //     return api
  //       .get('/accessories')
  //       .reply(200, {
  //         list: [
  //           {
  //             id: 'access-01-xxx-yyy-zzz',
  //             name: 'daemon-01',
  //             type: 'daemon',
  //           },
  //         ],
  //       })
  //       .get('/accessories/access-01-xxx-yyy-zzz/token')
  //       .reply(200, {
  //         token: 'token-xxx.yyy.zzz',
  //       })
  //   })
  //   .nock('wss://daemon-bridge.com:80', (api: any) => {
  //     return api.get('/').reply(200, () => {
  //       return spigot({ objectMode: true }, function () {
  //         // @ts-ignore
  //         this.push(`id:\ndata: foo\n\n`)
  //       })
  //     })
  //   })
  //   .command([
  //     'daemon',
  //     '--accessory',
  //     'daemon-01',
  //     '--command',
  //     'echo $subject',
  //   ])
  //   .it('prints message')

  test
    .stdout()
    .nock(MailscriptApiServer, (api: any) => {
      return api
    })
    .command(['daemon'])
    .exit(2)
    .it('errors if no command provided')

  test
    .stdout()
    .nock(MailscriptApiServer, (api: any) => {
      return api
    })
    .command(['daemon', '--command', 'echo $subject'])
    .exit(2)
    .it('errors if no daemon provided')
})
