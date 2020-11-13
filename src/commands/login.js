const os = require('os')
const path = require('path')
const fs = require('fs')
const promisify = require('util').promisify

const { Command } = require('@oclif/command')
const { cli } = require('cli-ux')
const express = require('express')
const bodyParser = require('body-parser')
const writeFile = promisify(fs.writeFile)

const port = 14578
const remoteLoginUrl = 'http://localhost:3000'

class LoginCommand extends Command {
  async run() {
    let server
    // const { flags } = this.parse(RegisterCommand)
    // const name = flags.name || 'world'

    const app = express()
    app.use(bodyParser.urlencoded({ extended: false }))

    app.get('/token', (req, res) => {
      server.close()
      cli.action.stop()

      try {
        const verifiedToken = req.query.token

        const config = JSON.stringify({ apiKey: verifiedToken }, null, 2) + '\n'

        writeFile(path.join(os.homedir(), '.mailscript'), config)

        cli.info('Cli configured')
      } catch (error) {
        cli.error(error)
        cli.exit(1)
      }

      res.send('All setup, you can close the page now and go back to the cli!')
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

LoginCommand.flags = {
  // name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = LoginCommand
