import fs from 'fs'
import { expect, test } from '@oclif/test'
import { MailscriptApiServer } from './constants'

describe('sync', () => {
  const empty = fs.readFileSync('./test/data/empty.yaml').toString().trim()
  const simple = fs.readFileSync('./test/data/simple.yaml').toString().trim()

  describe('export', () => {
    describe('empty setup', () => {
      const nockExport = (api: any) => {
        return api
          .persist()
          .get('/addresses')
          .reply(200, {
            list: [],
          })
          .get('/triggers')
          .reply(200, { list: [] })
          .get('/actions')
          .reply(200, { list: [] })
          .get('/inputs')
          .reply(200, { list: [] })
          .get('/workflows')
          .reply(200, { list: [] })
      }

      test
        .stdout()
        .nock(MailscriptApiServer, nockExport)
        .command(['sync:export'])
        .exit(0)
        .it('gives skeleton yaml', (ctx) => {
          expect(ctx.stdout).to.contain(empty)
        })
    })

    describe('simple setup', () => {
      const nockExport = (api: any) => {
        return api
          .persist()
          .get('/addresses')
          .reply(200, {
            list: [
              {
                id: 'smith@mailscript.io',
                name: 'smith@mailscript.io',
                owner: 'xyz',
                createdAt: '2020-12-01T10:19:02.656Z',
                createdBy: 'xyz',
              },
            ],
          })
          .get('/addresses/smith@mailscript.io/keys')
          .reply(200, {
            list: [
              {
                id: 'mivAW1KCbhZ4eGOW6D8X',
                name: 'owner',
                read: true,
                createdAt: '2020-12-01T10:19:02.656Z',
                createdBy: 'xyz',
                write: true,
              },
            ],
          })
          .get('/inputs')
          .reply(200, {
            list: [
              {
                id: 'qMRjlCHqBgUpCI2XdzHn',
                owner: 'xyz',
                address: 'smith@mailscript.io',
                type: 'mailscript-email',
                createdAt: '2021-01-16T09:44:16.477Z',
                createdBy: 'xyz',
                name: 'smith@mailscript.io',
                key: 'mivAW1KCbhZ4eGOW6D8X',
              },
            ],
          })
          .get('/triggers')
          .reply(200, {
            list: [
              {
                id: 'Vp806RUwBKl8lcm0QLD2',
                name: 'from-github',
                owner: 'xyz',
                createdAt: '2021-01-16T09:50:52.850Z',
                createdBy: 'xyz',
                composition: [
                  {
                    type: 'leaf',
                    criteria: {
                      domain: 'github.com',
                    },
                  },
                ],
              },
            ],
          })
          .get('/actions')
          .reply(200, {
            list: [
              {
                id: 'ENJLJC2tFeWWkJHm2kv3',
                owner: 'xyz',
                type: 'mailscript-email',
                createdAt: '2021-01-16T13:05:03.052Z',
                createdBy: 'xyz',
                name: 'forward-01',
                config: {
                  forward: 'john.kane84@gmail.com',
                  type: 'forward',
                  from: 'smith@mailscript.io',
                  key: 'mivAW1KCbhZ4eGOW6D8X',
                },
              },
            ],
          })
          .get('/workflows')
          .reply(200, {
            list: [
              {
                id: 'zcYyhU2V9zKlLGTpBYnE',
                name: 'personal-forward',
                owner: 'xyz',
                createdAt: '2020-12-01T11:35:45.906Z',
                createdBy: 'xyz',
                input: 'qMRjlCHqBgUpCI2XdzHn',
                trigger: 'Vp806RUwBKl8lcm0QLD2',
                action: 'ENJLJC2tFeWWkJHm2kv3',
              },
            ],
          })
      }

      test
        .stdout()
        .nock(MailscriptApiServer, nockExport)
        .command(['sync:export'])
        .exit(0)
        .it('outputs yaml', (ctx) => {
          // require('fs').writeFileSync('example.json', ctx.stdout.toString())
          expect(ctx.stdout).to.contain(simple)
        })
    })
  })

  // describe('import', () => {
  //   const nockImportEmpty = (api: any) => {
  //     return api
  //       .persist()
  //       .persist()
  //       .get('/addresses')
  //       .reply(200, {
  //         list: [],
  //       })
  //       .get('/accessories')
  //       .reply(200, { list: [] })
  //       .get('/workflows')
  //       .reply(200, { list: [] })
  //   }

  //   const nockImportAddressOnly = (api: any) => {
  //     return api
  //       .persist()
  //       .get('/addresses')
  //       .reply(200, {
  //         list: [],
  //       })
  //       .post('/addresses')
  //       .reply(201, { id: 'address-xxx' })
  //       .post('/addresses/smith@mailscript.io/keys')
  //       .reply(201, { id: 'key-yyy' })
  //       .get('/addresses/smith@mailscript.io/keys')
  //       .reply(200, { list: [] })
  //       .get('/accessories')
  //       .reply(200, { list: [] })
  //       .get('/workflows')
  //       .reply(200, { list: [] })
  //   }

  //   const nockImportAddressOnlyExisting = (api: any) => {
  //     return api
  //       .persist()
  //       .get('/addresses')
  //       .reply(200, {
  //         list: [
  //           {
  //             id: 'smith@mailscript.io',
  //             name: 'smith@mailscript.io',
  //             owner: 'xyz',
  //             createdAt: '2020-12-01T10:19:02.656Z',
  //             createdBy: 'xyz',
  //           },
  //         ],
  //       })
  //       .get('/addresses/smith@mailscript.io/keys')
  //       .reply(200, {
  //         list: [
  //           {
  //             id: 'mivAW1KCbhZ4eGOW6D8X',
  //             name: 'owner',
  //             read: true,
  //             createdAt: '2020-12-01T10:19:02.656Z',
  //             createdBy: 'xyz',
  //             write: true,
  //           },
  //         ],
  //       })
  //       .get('/accessories')
  //       .reply(200, {
  //         list: [
  //           {
  //             id: 'jaLhjOMQ7THh1ei9hoVZ',
  //             owner: 'xyz',
  //             address: 'smith@mailscript.io',
  //             type: 'mailscript-email',
  //             createdAt: '2020-12-01T10:19:02.656Z',
  //             createdBy: 'xyz',
  //             name: 'smith@mailscript.io',
  //             sms: null,
  //             key: 'mivAW1KCbhZ4eGOW6D8X',
  //           },
  //           {
  //             id: 'webhook-xyz',
  //             owner: 'xyz',
  //             type: 'webhook',
  //             createdAt: '2020-12-01T10:18:04.195Z',
  //             createdBy: 'xyz',
  //             name: 'webhook',
  //           },
  //         ],
  //       })
  //       .get('/workflows')
  //       .reply(200, {
  //         list: [
  //           {
  //             id: 'zcYyhU2V9zKlLGTpBYnE',
  //             name: 'personal-forward',
  //             owner: 'xyz',
  //             trigger: {
  //               accessoryId: 'jaLhjOMQ7THh1ei9hoVZ',
  //               config: {
  //                 criterias: [
  //                   {
  //                     sentTo: 'smith@mailscript.io',
  //                   },
  //                 ],
  //               },
  //             },
  //             createdAt: '2020-12-01T11:35:45.906Z',
  //             createdBy: 'xyz',
  //             actions: [
  //               {
  //                 accessoryId: 'jaLhjOMQ7THh1ei9hoVZ',
  //                 config: {
  //                   forward: 'john@smith.me',
  //                   type: 'forward',
  //                 },
  //               },
  //             ],
  //           },
  //         ],
  //       })
  //   }

  //   test
  //     .stdout()
  //     .nock(MailscriptApiServer, nockImportEmpty)
  //     .command(['sync:import', '--path', './test/data/empty.yaml'])
  //     .it('no updates on empty yaml import', (ctx) => {
  //       expect(ctx.stdout).to.contain(`Syncing to Mailscript`.trim())
  //     })

  //   test
  //     .stdout()
  //     .nock(MailscriptApiServer, nockImportAddressOnly)
  //     .command(['sync:import', '--path', './test/data/address-only.yaml'])
  //     .it('updates on new addresses/keys', (ctx) => {
  //       expect(ctx.stdout).to.contain(`Syncing to Mailscript`.trim())
  //     })

  //   test
  //     .stdout()
  //     .nock(MailscriptApiServer, nockImportAddressOnlyExisting)
  //     .command(['sync:import', '--path', './test/data/address-only.yaml'])
  //     .it('no updates on import existing addresses/keys', (ctx) => {
  //       expect(ctx.stdout).to.contain(`Syncing to Mailscript`.trim())
  //     })

  //   test
  //     .stdout()
  //     .command(['sync:import'])
  //     .exit(2)
  //     .it('errors if no path provided')

  //   test
  //     .stdout()
  //     .command(['sync:import', '--path', 'nonexistant.yaml'])
  //     .exit(1)
  //     .it('errors if path does not exist', (ctx) => {
  //       expect(ctx.stdout).to.contain('Path does not exist')
  //     })
  // })
})
