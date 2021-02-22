/* eslint-disable no-await-in-loop */
import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as api from '../api'
import { handle } from 'oazapfts'
import withStandardErrors from './errorHandling'
import { Command } from '@oclif/command'

export default async function verifySmsFlow(
  client: typeof api,
  targetSms: string,
  command: Command,
) {
  const verificationId = await handle(
    client.addVerification({
      type: 'sms',
      sms: targetSms,
    }),
    withStandardErrors(
      { 201: ({ id }: api.AddVerificationResponse) => id },
      command,
    ),
  )

  cli.info('')
  cli.info(`Verification code sent to ${chalk.bold(targetSms)}.`)
  cli.info('')
  let code
  while (!code) {
    code = await cli.prompt('Please enter the code from the text message')

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
      client.verify(verificationId, { sms: targetSms, code }),
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

  return true
}
