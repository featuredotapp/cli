/* eslint-disable no-await-in-loop */
import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as api from '../api'
import { handle } from 'oazapfts'
import withStandardErrors from './errorHandling'
import { Command } from '@oclif/command'

export default async function verifyEmailFlow(
  client: typeof api,
  targetEmail: string,
  command: Command,
): void {
  const verificationId = await handle(
    client.addVerification({
      type: 'email',
      email: targetEmail,
    }),
    withStandardErrors(
      { 201: ({ id }: api.AddVerificationResponse) => id },
      command,
    ),
  )

  cli.info('')
  cli.info(`Verification email sent to ${chalk.bold(targetEmail)}.`)
  cli.info('')
  let code
  while (!code) {
    code = await cli.prompt('Please enter the code from the email')

    if (!code) {
      continue
    }

    if (!/^\d{6}$/.test(code)) {
      code = undefined
      cli.log('Verification failed:')
      cli.log(`  ${chalk.red('Badly formed code')}`)
      continue
    }

    const { verified, error } = await handle(
      client.verify(verificationId, { email: targetEmail, code }),
      withStandardErrors(
        {
          200: () => ({
            verified: true,
          }),
          403: ({ error }: api.ErrorResponse) => ({
            verified: false,
            error,
          }),
          404: ({ error }: api.ErrorResponse) => ({
            verified: false,
            error,
          }),
        },
        command,
      ),
    )

    if (!verified) {
      code = undefined
      cli.log('Verification failed:')
      cli.log(`  ${chalk.red(error)}`)
      cli.log('')
      continue
    }
  }
}
