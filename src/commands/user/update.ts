import { Command, flags } from '@oclif/command'
import chalk from 'chalk'
import { handle } from 'oazapfts'
import * as api from '../../api'
import setupApiClient from '../../setupApiClient'
import withStandardErrors from '../../utils/errorHandling'

export async function addAddress(
  client: typeof api,
  command: Command,
  address: string,
) {
  await handle(client.addAddress({ address }), withStandardErrors({}, command))

  return { address }
}

export default class UserUpdate extends Command {
  static description = 'update your user details'

  static flags = {
    help: flags.help({ char: 'h' }),
    displayname: flags.string({
      char: 'd',
      description: 'the display name to use when sending emails',
      required: true,
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(UserUpdate)

    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    return this.add(client, flags)
  }

  async add(client: typeof api, flags: { displayname: string }): Promise<void> {
    if (!flags.displayname) {
      this.log(
        'Please provide a display name to update: mailscript user:update --displayname "Joan Smith"',
      )

      this.exit(1)
    }

    await handle(
      client.updateUser({ displayName: flags.displayname }),
      withStandardErrors(
        {
          '200': () => {
            this.log(`User updated`)
          },
          '400': ({ error }: api.ErrorResponse) => {
            this.log(chalk.red(`${chalk.bold('Error')}: ${error}`))
            this.exit(1)
          },
          '403': ({ error }: api.ErrorResponse) => {
            this.log(chalk.red(`${chalk.bold('Error')}: ${error}`))
            this.exit(1)
          },
        },
        this,
      ),
    )
  }
}
