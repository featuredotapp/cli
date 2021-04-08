import { Command, flags } from '@oclif/command'

import * as api from '../../api'
import setupApiClient from '../../setupApiClient'

import { handle } from 'oazapfts'
import withStandardErrors from '../../utils/errorHandling'

type FlagsType = {
  [key: string]: any
}

export default class DomainsList extends Command {
  static description =
    'list all domains linked wih your account (both verified and unverified)'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    this.parse(DomainsList)

    const client = await setupApiClient()

    if (!client) {
      this.log('Could not connect to API. Check your internet connection')
      this.exit(1)
    }

    return this.list(client)
  }

  async list(client: typeof api): Promise<void> {
    return handle(
      client.getAllDomains(),
      withStandardErrors(
        {
          '200'({ id }: api.GetAllDomainsResponse) {
            if (!id) {
              this.log("You don't own any domains")
              return
            }
            this.log('Your domains:')
            for (const domain of id) {
              this.log('-', domain)
            }
          },
        },
        this,
      ),
    )
  }
}
