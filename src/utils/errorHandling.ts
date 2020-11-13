import { Command } from '@oclif/command'
import * as api from '../api'

export default function withStandardErrors(obj: any, command: Command) {
  return Object.assign(
    {},
    {
      '400': ({ error }: api.ErrorResponse) => {
        command.log(`Internal error: ${error}`)
        command.exit(1)
      },
      '403': ({ error }: api.ErrorResponse) => {
        command.log(`Error authenticating: ${error}`)
        command.log(
          'Try setting up your api key in ~/.mailscript by logging in: mailscript login',
        )
        command.exit(1)
      },
      '405': ({ error }: api.ErrorResponse) => {
        command.log(error)
        command.exit(1)
      },
      default: (response: any) => {
        command.log(JSON.stringify(response))
        command.exit(1)
      },
    },
    obj,
  )
}
