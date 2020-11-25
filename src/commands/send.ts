import { Command, flags } from '@oclif/command'
import { handle } from 'oazapfts'
import setupApiClient from '../setupApiClient'
import withStandardErrors from '../utils/errorHandling'

export default class Send extends Command {
  static description = 'send an email from a mailscript address'

  static flags = {
    help: flags.help({ char: 'h' }),
    to: flags.string({
      char: 't',
      required: true,
      description: 'email address to send to',
    }),
    from: flags.string({
      char: 't',
      required: true,
      description: 'email address to use for sending',
    }),
    subject: flags.string({
      char: 's',
      required: true,
      description: 'subject line of email',
    }),
    text: flags.string({
      char: 'b',
      required: false,
      description: 'text of email',
    }),
  }

  static args = [{ name: 'file' }]

  async run(): Promise<any> {
    const { flags } = this.parse(Send)

    const to = flags.to
    const from = flags.from
    const subject = flags.subject
    const text = flags.text

    const client = await setupApiClient()

    return handle(
      client.send({
        to,
        from,
        subject,
        text,
      }),
      withStandardErrors(
        {
          '200': (_response: any) => {
            this.log('Email sent')
          },
        },
        this,
      ),
    )
  }
}
