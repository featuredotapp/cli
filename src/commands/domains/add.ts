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

export default class DomainsAdd extends Command {
  static description = 'add a domain'

  static flags = {
    help: flags.help({ char: 'h' }),
    domain: flags.string({
      char: 'd',
      description: 'the domain to add to your account',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(DomainsAdd)

    const client = await setupApiClient()

    if (!client) {
      this.log('Could not connect to API. Check your internet connection')
      this.exit(1)
    }

    return this.add(client, flags)
  }

  async add(client: typeof api, { domain }: FlagsType): Promise<void> {
    if (!domain) {
      this.log('Please provide a domain to be setup')

      this.exit(1)
    }

    return handle(
      client.addDomain({ domain } as api.AddDomainRequest),
      withStandardErrors(
        {
          '200'({ domain, records }: api.DomainResponse) {
            this.log(
              'Please add the following DNS record to your domain,',
              domain + ',',
              'to verify your ownership',
            )
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
