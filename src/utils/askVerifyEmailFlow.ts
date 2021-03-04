import chalk from 'chalk'
import * as api from '../api'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import verifyEmailFlow from './verifyEmailFlow'

// eslint-disable-next-line max-params
export async function askVerifyEmailFlow(
  client: typeof api,
  alias: string,
  stopText: string,
  noninteractive: boolean,
  command: Command,
) {
  if (noninteractive) {
    command.log(
      chalk.red(
        `${chalk.bold('Error')}: the email address ${chalk.bold(
          alias,
        )} must be verified before being included in an ${chalk.bold(
          'alias',
        )} action`,
      ),
    )
    command.log(chalk.red(stopText))
    command.exit(1)
  }

  command.log('')
  command.log(
    `The email address ${chalk.bold(
      alias,
    )} must be verified before being included in an ${chalk.bold(
      'alias',
    )} workflow.`,
  )

  command.log('')
  const verifyEmailAddress = await cli.confirm(
    `Do you want to send a verification email to ${chalk.bold(
      alias,
    )}? ${chalk.cyan('(y/n)')}`,
  )

  if (!verifyEmailAddress) {
    command.log(chalk.red(stopText))
    command.exit(1)
  }

  const verified = await verifyEmailFlow(client, alias, command)

  if (!verified) {
    command.exit(1)
  }

  command.log('')
}
