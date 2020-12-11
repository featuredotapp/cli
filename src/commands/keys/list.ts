import { Command, flags } from '@oclif/command'
import * as api from '../../api'
import { handle } from 'oazapfts'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'
import cli from 'cli-ux'

export default class KeysList extends Command {
  static description = 'list the address keys for an address'

  static flags = {
    help: flags.help({ char: 'h' }),
    address: flags.string({
      char: 'a',
      description: 'the email address to look for keys against',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(KeysList)

    const client = await setupApiClient()

    await this.list(client, flags)
  }

  async list(client: typeof api, flags: { address: string }): void {
    if (!flags.address) {
      this.log(
        'Please provide an address: mailscript keys list --address example@workspace.mailscript.com',
      )
      this.exit(1)
    }

    await handle(
      client.getAllKeys(flags.address),
      withStandardErrors(
        {
          '200': ({ list }: api.GetAllKeysResponse) => {
            if (!list || list.length === 0) {
              this.log(`you don't have any keys against that address`)
              this.exit(0)
            }

            this.log('')
            this.log(`Keys for ${flags.address}`)
            this.log('')

            cli.table(
              list,
              {
                id: {
                  header: 'Id',
                  get: (row) => row.id,
                },
                read: {
                  header: 'Read',
                  get: (row) => row.read,
                },
                write: {
                  header: 'Write',
                  get: (row) => row.write,
                },
              },
              { printLine: this.log },
            )
          },
        },
        this,
      ),
    )
  }
}
