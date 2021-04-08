import { Command, flags } from '@oclif/command'

import * as api from '../../api'
import setupApiClient from '../../setupApiClient'

import { handle } from 'oazapfts'
import withStandardErrors from '../../utils/errorHandling'

type FlagsType = {
  domain?: string

  [key: string]: any
}

export default class DomainsCheck extends Command {
  static description = 'check if a domain has been verified to your account'

  static flags = {
    help: flags.help({ char: 'h' }),
    domain: flags.string({
      char: 'd',
      description: 'the domain to check verification of on your account',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(DomainsCheck)

    const client = await setupApiClient()

    if (!client) {
      this.log('Could not connect to API. Check your internet connection')
      this.exit(1)
    }

    return this.check(client, flags)
  }

  async check(client: typeof api, flags: FlagsType): Promise<void> {
    if (!flags.domain) {
      this.log('Please provide a domain to check')

      this.exit(1)
    }

    return handle(
      client.checkDomainVerify(flags.domain),
      withStandardErrors(
        {
          '200'({ domain, success }: api.CheckDomainVerify) {
            if (success) {
              this.log(domain, 'has been verified to your account')
            } else {
              this.log(domain, 'has not been verified to your accout')
            }
          },
        },
        this,
      ),
    )
  }
}
