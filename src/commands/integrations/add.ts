import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'

const {
  MAILSCRIPT_LOGIN_URL: remoteLoginUrl = 'https://login.mailscript.com',
} = process.env

type FlagsType = {
  gdrive?: boolean

  [key: string]: any
}

export default class IntegrationsAdd extends Command {
  static description = 'add an integration'

  static flags = {
    help: flags.help({ char: 'h' }),
    gdrive: flags.boolean({
      description: 'asdf',
    }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(IntegrationsAdd)

    return this.add(flags)
  }

  async add(flags: FlagsType): Promise<void> {
    if (!flags.gdrive) {
      this.log(
        'Please provide an integrations to be setup, one of:\n  --gdrive',
      )

      this.exit(1)
    }

    cli.open(`${remoteLoginUrl}/integrations?force=google`)
  }
}
