/* eslint-disable no-await-in-loop */
import * as os from 'os'
import * as path from 'path'
import * as http from 'http'
import chalk from 'chalk'
import { writeFile as writeFileRaw } from 'fs'
import { promisify } from 'util'

import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import express from 'express'
import * as bodyParser from 'body-parser'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'
import * as api from '../api'
import { handle } from 'oazapfts'
// import { addAddress } from './addresses/add'
import verifyEmailFlow from '../utils/verifyEmailFlow'
import { addAddress } from './addresses/add'
const writeFile = promisify(writeFileRaw)

const {
  MAILSCRIPT_LOGIN_URL: remoteLoginUrl = 'https://login.mailscript.com',
  MAILSCRIPT_CONFIG_PATH: configFilePath = path.join(
    os.homedir(),
    '.mailscript',
  ),
  MAILSCRIPT_LOGIN_PORT: port = 14578,
  MAILSCRIPT_EMAIL_DOMAIN: emailDomain = 'mailscript.com',
} = process.env

export default class LoginCommand extends Command {
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
      } catch (error) {
        cli.error(error)
      }

      res.redirect('/LoginComplete.html')
    })

    app.post('/complete', async (req, res) => {
      res.status(200).send('complete received')

      setTimeout(() => {
        server.close()
        cli.action.stop()

        this._ftue()
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
    cli.log('Account link configured')

    this._ftue()
  }

  private generateOfflineLink() {
    return `${remoteLoginUrl}?offline=true`
  }

  private async writeConfigFile(token: string) {
    const config = JSON.stringify({ apiKey: token }, null, 2) + '\n'

    return writeFile(configFilePath, config)
  }

  private async _ftue() {
    const client = await setupApiClient()

    if (!client) {
      this.exit(1)
    }

    const { list: workspaces } = await handle(
      client.getAllWorkspaces(),
      withStandardErrors({}, this),
    )

    if (workspaces && workspaces.length > 0) {
      cli.info('')
      cli.info(`🎉 ${chalk.green('Success')} - cli configured 🎉`)
      return
    }

    let username
    while (!username) {
      cli.info('')
      username = await cli.prompt('Please choose a username')

      if (!username) {
        continue
      }

      const response = await handle(
        client.addWorkspace({ workspace: username }),
        withStandardErrors(
          {
            201: () => {
              return { added: true }
            },
            400: ({ error }: api.ErrorResponse) => {
              return { added: false, error }
            },
          },
          this,
        ),
      )

      if (response.added) {
        continue
      }

      username = undefined
      cli.info('')
      cli.info(`Could not claim username:`)
      cli.info(chalk.red(`  ${response.error}`))
    }

    cli.info('')
    cli.action.start(`Setting up username: ${chalk.bold(username)} `)
    cli.action.stop()

    const defaultAddress = `${username}@${emailDomain}`
    cli.action.start(
      `Setting up default address: ${chalk.bold(defaultAddress)} `,
    )

    await addAddress(client, this, defaultAddress)

    cli.action.stop()

    const user = await handle(
      client.getAuthenticatedUser(),
      withStandardErrors(
        {
          200: (response: api.User) => response,
        },
        this,
      ),
    )

    cli.log('')
    const useAlias = await cli.confirm(
      `Do you want to alias ${chalk.bold(
        defaultAddress,
      )} to another email address? ${chalk.cyan('(y/n)')}`,
    )

    if (useAlias) {
      const useAuthEmail = await cli.confirm(
        `Use ${chalk.bold(user.email)}? ${chalk.cyan('(y/n)')}`,
      )

      let targetEmail
      if (useAuthEmail) {
        targetEmail = user.email
      } else {
        cli.info('')

        while (!targetEmail) {
          targetEmail = await cli.prompt('Enter email')

          if (!targetEmail) {
            continue
          }

          if (!targetEmail.includes('@')) {
            cli.info('')
            cli.info(`  ${chalk.red(`Not a valid email address`)}`)
            cli.info('')
            targetEmail = undefined
          }
        }

        const verified = await verifyEmailFlow(client, targetEmail, this)

        if (!verified) {
          cli.exit(1)
        }
      }

      cli.info('')
      cli.action.start(
        `Setting up alias workflow from ${chalk.bold(
          defaultAddress,
        )} to ${chalk.bold(targetEmail)} `,
      )

      const aliasActionId = await handle(
        client.addAction({
          name: 'email-personal-address',
          type: 'mailscript-email',
          config: {
            type: 'alias',
            alias: targetEmail,
          },
        }),
        withStandardErrors(
          {
            201: ({ id }: api.AddActionResponse) => id,
          },
          this,
        ),
      )

      const inputs: api.MailscriptEmailInput[] = await handle(
        client.getAllInputs(),
        withStandardErrors(
          {
            200: ({ list }: api.GetAllInputsResponse) => list,
          },
          this,
        ),
      )

      const input = inputs.find(({ name }) => name === defaultAddress)

      if (!input) {
        this.log(
          chalk.red(`${chalk.bold('Error')}: default address input not setup`),
        )
        this.exit(1)
      }

      await handle(
        client.addWorkflow({
          name: 'redirect to ' + targetEmail,
          input: input.id,
          action: aliasActionId,
        }),
        withStandardErrors({}, this),
      )

      cli.action.stop()
    }

    cli.info('')
    cli.info(
      `You can add further addresses e.g. example@${username}.${emailDomain}, with the 'mailscript addresses:add' command.`,
    )
    cli.info('')
    cli.info(`🎉 ${chalk.green('Success')} - cli configured 🎉`)
  }
}
