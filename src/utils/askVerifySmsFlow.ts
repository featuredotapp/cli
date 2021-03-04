import chalk from 'chalk'
import * as api from '../api'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import verifySmsFlow from './verifySmsFlow'

// eslint-disable-next-line max-params
export async function askVerifySmsFlow(
  client: typeof api,
  number: string,
  stopText: string,
  noninteractive: boolean,
  command: Command,
) {
  if (noninteractive) {
    command.log(
      chalk.red(
        `${chalk.bold('Error')}: the sms number ${chalk.bold(
          number,
        )} must be verified before being included in an ${chalk.bold(
          'sms',
        )} action`,
      ),
    )
    command.log(chalk.red(stopText))
    command.exit(1)
  }

  command.log(
    `The sms number ${chalk.bold(
      number,
    )} must be verified before being included in an ${chalk.bold(
      'sms',
    )} action.`,
  )

  command.log('')
  const verifySms = await cli.confirm(
    `Do you want to send a verification code to ${chalk.bold(
      number,
    )}? ${chalk.cyan('(y/n)')}`,
  )

  if (!verifySms) {
    command.log(chalk.red(stopText))
    command.exit(1)
  }

  const verified = await verifySmsFlow(client, number, command)

  if (!verified) {
    command.exit(1)
  }

  command.log(`Verified: ${number}`)
}
