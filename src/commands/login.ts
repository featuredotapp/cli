import * as os from 'os'
import * as path from 'path'
import * as http from 'http'
import { writeFile as writeFileRaw } from 'fs'
import { promisify } from 'util'

import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import * as express from 'express'
import * as bodyParser from 'body-parser'
const writeFile = promisify(writeFileRaw)

const port = 14578
const remoteLoginUrl = 'http://localhost:3000'

class LoginCommand extends Command {
  async run() {
    // eslint-disable-next-line prefer-const
    let server: http.Server

    const app: express.Application = express()
    app.use(bodyParser.urlencoded({ extended: false }))

    app.use(express.static(path.join(__dirname, '../../www')))

    app.get('/token', (req, res) => {
      try {
        const verifiedToken = req.query.token

        const config = JSON.stringify({ apiKey: verifiedToken }, null, 2) + '\n'

        writeFile(path.join(os.homedir(), '.mailscript'), config)

        cli.info('Cli configured')
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
}

LoginCommand.description = `
Link or create your MailScript account
`

LoginCommand.flags = {}

module.exports = LoginCommand
