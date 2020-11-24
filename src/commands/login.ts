import * as os from 'os'
import * as path from 'path'
import * as http from 'http'
import { writeFile as writeFileRaw } from 'fs'
import { promisify } from 'util'

import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import * as express from 'express'
import * as bodyParser from 'body-parser'
const writeFile = promisify(writeFileRaw)

const port = 14578

const {
  MAILSCRIPT_LOGIN_URL: remoteLoginUrl = 'https://mailscript-firebase.web.app',
} = process.env

class LoginCommand extends Command {
  static description = `
Link or create your MailScript account
`

  static flags = {
    offline: flags.boolean({ char: 'o', default: false, required: false }),
  }

  async run() {
    const { flags } = this.parse(LoginCommand)

    if (flags.offline) {
      return this.runOfflineLogin()
    }

    return this.runWebLogin()
  }

  private runWebLogin() {
    // eslint-disable-next-line prefer-const
    let server: http.Server

    const app: express.Application = express()
    app.use(bodyParser.urlencoded({ extended: false }))

    app.use(express.static(path.join(__dirname, '../../www')))

    app.get('/token', async (req, res) => {
      try {
        const token = req.query.token

        await this.writeConfigFile(token as string)

        cli.info('🎉 Success - cli configured 🎉')
      } catch (error) {
        cli.error(error)
      }

      res.redirect('/LoginComplete.html')

      setTimeout(() => {
        server.close()
        cli.action.stop()
      }, 500)
    })

    server = app.listen(port)

    cli.action.start('Linking cli with MailScript account')
    cli.open(
      `${remoteLoginUrl}?redirect=${Buffer.from(
        `http://localhost:${port}/token`,
      ).toString('base64')}`,
    )
  }

  private async runOfflineLogin() {
    cli.log('Logging in using offline mode')
    cli.log('')
    cli.log('Copy and open the link: ')
    const link = this.generateOfflineLink()
    cli.url(link, link)
    cli.log('')
    const token = await cli.prompt('Enter the code from the link')
    this.writeConfigFile(token)
    cli.log('')
    cli.info('🎉 Success - cli configured 🎉')
  }

  private generateOfflineLink() {
    return `${remoteLoginUrl}`
  }

  private async writeConfigFile(token: string) {
    const config = JSON.stringify({ apiKey: token }, null, 2) + '\n'

    return writeFile(path.join(os.homedir(), '.mailscript'), config)
  }
}

module.exports = LoginCommand
