/* eslint-disable no-console */
import { expect } from '@oclif/test'
import chalk from 'chalk'
import setupApiClient from '../src/setupApiClient'

describe('Setup API Client', () => {
  let initialVar: string | undefined
  let initialLog: any | undefined

  beforeEach(() => {
    initialVar = process.env.MAILSCRIPT_CONFIG_PATH
    process.env.MAILSCRIPT_CONFIG_PATH = './nonexistant.yml'

    initialLog = console.log
  })

  afterEach(() => {
    process.env.MAILSCRIPT_CONFIG_PATH = initialVar

    console.log = initialLog
  })

  it('should error if config file does not exist', async () => {
    let errorText
    console.log = (text) => {
      errorText = text
    }

    const result = await setupApiClient()

    expect(result).eq(undefined)
    expect(errorText).eq(
      chalk.red(
        `${chalk.bold(
          'Error',
        )}: account not linked, use 'mailscript login' to link account`,
      ),
    )
  })
})
