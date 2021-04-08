import { Command, flags } from '@oclif/command'

import * as api from '../../api'
import setupApiClient from '../../setupApiClient'

import { handle } from 'oazapfts'
import withStandardErrors from '../../utils/errorHandling'

type FlagsType = {
  domain?: string

  [key: string]: any
}

export default class DomainsDelete extends Command {
  static description = 'delete a domain'

  static flags = {
    help: flags.help({ char: 'h' }),
    domain: flags.string({
      char: 'd',
      description: 'the domain to be removed from your account',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(DomainsDelete)

    const client = await setupApiClient()

    if (!client) {
      this.log('Could not connect to API. Check your internet connection')
      this.exit(1)
    }

    return this.delete(client, flags)
  }

  async delete(client: typeof api, { domain }: FlagsType): Promise<void> {
    if (!domain) {
      this.log('Please provide a domain to delete')

      this.exit(1)
    }

    return handle(
      client.removeDomainVerify(domain),
      withStandardErrors(
        {
          '200'() {
            this.log(domain, 'has been removed from your account')
          },
        },
        this,
      ),
    )
  }
}
