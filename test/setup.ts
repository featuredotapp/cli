import * as mock from 'mock-fs'
import * as os from 'os'
import * as path from 'path'

export async function mochaGlobalSetup() {
  throw new Error('asdf')
  const mailscriptFile = path.join(os.homedir(), '.mailscript')
  const fakeMailscriptContent = JSON.stringify(
    {
      apiKey:
        'eyJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NLZXkiOiJjYWU0NWJjYi1mZDNiLTQ4Y2UtODBkNS05ZmViOTMyZDA5MjEiLCJpc3MiOiJodHRwczovL21haWxzY3JpcHQuY29tIiwiaWF0IjoxNjA1OTc1NTIwfQ.idhsPYgO3roOBO9HljnqR87xSst-wX4QtEFaAzVtDvA',
    },
    null,
    2,
  )

  mock({
    [mailscriptFile]: fakeMailscriptContent,
    // path: {
    //   to: {
    //     'sub-dir': {
    //       'another-file.md': 'Markdown content',
    //     },
    //   },
    // },
  })
}

export async function mochaGlobalTeardown() {
  mock.restore()
}
