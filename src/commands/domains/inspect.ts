import { Command, flags } from '@oclif/command'

import * as api from '../../api'
import setupApiClient from '../../setupApiClient'

import { handle } from 'oazapfts'
import withStandardErrors from '../../utils/errorHandling'

import staticDnsRecords from './staticDnsRecords'

type FlagsType = {
  domain?: string

  [key: string]: any
}

export default class DomainsInspect extends Command {
  static description = 'inspect a domain'

  static flags = {
    help: flags.help({ char: 'h' }),
    domain: flags.string({
      char: 'd',
      description: 'the domain to inspect from your account',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(DomainsInspect)

    const client = await setupApiClient()

    if (!client) {
      this.log('Could not connect to API. Check your internet connection')
      this.exit(1)
    }

    return this.inspect(client, flags)
  }

  async inspect(client: typeof api, { domain }: FlagsType): Promise<void> {
    if (!domain) {
      this.log('Please provide a domain to inspect')

      this.exit(1)
    }

    return handle(
      client.getDomainVerify(domain),
      withStandardErrors(
        {
          '200'({ domain, records }: api.DomainResponse) {
            this.log('DNS records for', domain, 'should include the following:')
            for (const { type, name, value } of [...records, ...staticDnsRecords]) {
              this.log()
              this.log('Type:', type)
              this.log('Name:', name)
              this.log('Value:', value)
            }
            this.log()
            this.log('Type: MX')
            this.log('Name: @')
            this.log('Value #1: haraka.mailscript.com')
            this.log('Value #2: in.mailscript.com')
          },
        },
        this,
      ),
    )
  }
}
