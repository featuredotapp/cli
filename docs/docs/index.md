<img src="./images/logo-black.png" width="300" alt="Mailscript logo" />

# Welcome to the Mailscript documentation

Mailscript brings the best features of bots and smart contracts for email.

Use our free API and CLI, in any language. No complicated setups.

## Example use cases

* Setup and route your companies email addresses based on a yaml file. See `mailscript sync:export --path my-email-infra.yml` for how to setup `email infrastructure as code`.
* Redirect engineering emails based on a schedule over the holidays. Mailscript `workflows` allow your team to edit the flow of emails in your company in one place.
* Integrate that weekly csv reporting email - you know the one, it comes in every week on an email as an attached csv file - it needs to be downloaded, parsed through a cleanup script and uploaded in the company reporting database. Use `mailscript daemon` to automate the task away.
* Auto-provision a new employees email address based off the Github event “Added to Team”, take a look at our `Github actions` integration.
* Setup the “New Features” weekly email for your app. Sync the app's user list to a Mailscript mailing list with our `api`, then setup a `workflow` for the sales team to push the latest features out to the list.

## Technologies

Learn about the different technologies that make-up Mailscript:

- [CLI](#cli)
- [API](#api)
- [SDK Clients](#sdk-clients)
- [Templates](#templates)
- [Community](#community)

### CLI

Getting started is as easy as `yarn global add mailscript`

### API

It is possible to integrate Mailscript's services directly into your own projects. To do so you can interact with the API directly. The API was built using the [OpenAPI Specification](https://swagger.io/resources/open-api/) which allows developers to interact with the underlying abstractions directly.

You can use the following API definitions file: [`http://api.mailscript.com/v2/swagger`](http://api.mailscript.com/v2/swagger) and we also offer a playground to try the API here: [`http://api.mailscript.com/v2/docs`](http://api.mailscript.com/v2/docs).

Take into consideration that these two endpoints work with production code, so any updates you submit will update your account's configuration.

### SDK Clients

Coming soon. We will be offering sdk clients that implement object wrappers on top of the API. Developers will be able to import/require these libraries directly into their codebases to start using Mailscript.

### Templates

Read our templates on setting up your infrastructure and automations with Mailscript in GitHub.

#### Pipe email attachments to an endpoint

Setup the first step of a pipeline with data from email attachments: [attachments to webhook](https://github.com/mailscript/cli/tree/main/packages/templates/attachments-to-webhook).

#### Manage your email infrastructure

Version control your email infrastructure and setup a continuous integration process whenever you submit changes: [email infrastructure management](https://github.com/mailscript/cli/tree/main/packages/templates/email-infrastructure).

#### Auto-reply to first time senders

Let first time senders know you'll get back to them: [auto-reply to first time senders](https://github.com/mailscript/cli/tree/main/packages/templates/auto-reply-first-time-sender).

#### Escalate notifications

Send an sms text message when the important messages arrive: [two alert messages in a minute to send sms](https://github.com/mailscript/cli/tree/main/packages/templates/two-alerts-to-sms.

#### Send messages to your team channels

Notify your discord/slack channels when something needs their attention: [run failed to discord #channel](https://github.com/mailscript/cli/tree/main/packages/templates/run-failed-to-discord).

#### Setup shared addresses for your team

Setup a group of employees to receive messages directed to an address and have them all be able to reply from such address: [shared address for teams](https://github.com/mailscript/cli/tree/main/packages/templates/shared-address-for-team).

## Community

Join our public [Discord](https://discord.gg/X9zvQgzwUh), visit our [GitHub](https://github.com/mailscript), follow us on [Twitter](https://twitter.com/getmailscript), and check out the [Blog](https://blog.mailscript.com/)!
