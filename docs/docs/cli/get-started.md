# Installation and Account Setup

To create an account, you first need to install the Mailscript CLI. The CLI is where you:

- Manage accounts.
- Claim addresses.
- Create keys for your addresses.
- Create workflows for your automations.
- Add triggers for your workflows.
- Add actions for your workflows.
- And more.

The first step is to download and install the executable.

## Install the CLI executable

Install the CLI executable from the npm registry: [mailscript](https://www.npmjs.com/package/mailscript) with

```sh
yarn global add mailscript
```

or

```sh
npm install -g mailscript
```

## Account setup

The next step is to initialize an account. The CLI uses a variety of identity providers, so choose the one you prefer.

```sh
mailscript login
```

### Offline support

The CLI offers a secondary login flow for setups without access to a browser instance (eg. a docker container). It will have ask you to go over a login flow elsewhere and return a code to resume the sign-in process within the CLI context.

```sh
mailscript login --offline
```

### Initialize

If this is the first time you are signing in you'll be prompted to pick a username. Once the you've has selected a username your account setup will be complete.

## Addresses

`Addresses` allow you to send and receive email messages. You receive a top level domain address corresponding to your selected username (eg. _username@mailscript.com_) and you can create addresses using your username as a first level subdomain (eg. _team@username.mailscript.com_)

You can create an `address` easily:

```sh
mailscript addresses:add --address address@username.mailscript.com
```

### Keys

`Keys` allow you to share scoped access (_write_ and/or _read_) to addresses you control with other people. Whenever you add an address a key is generated with full access for you.

You can list the keys for any address you control with the following command:

```
mailscript keys:list --address [your email address]
```

#### SMTP gateway

`Keys` with the _write_ access can be used to setup `smtp` access to allow email clients to send messages from any mailscript address.

To do so use the following configuration:

```sh
host: smtp.mailscript.com
port: 465
user: full address (eg. username@mailscript.com)
pass: a key corresponding to the address with write access
```

Next, you can start setting up workflows whenever your addresses receive an email message.

## Workflows

Workflows allow you to setup automations when a message arrives at any of the addresses you control. A workflow consists of a trigger and an action. Whenever a trigger is met the corresponding actions will be executed.

### Triggers

Currently mailscript allows you to set up triggers based on incoming messages to addresses you control. You can set criteria to filter specific messages to trigger actions (eg. messages sent from a specific address, messages that include attachments, that contain specific words in the subject or body, messages that contain attachments, mailscript even allows you to set up filters matching specific headers in your email message).

Triggers can be composed together to form new named triggers, allowing for the combination of criteria. See the [Composing Triggers](#composing-triggers) section for details.

#### Setting up Triggers

A trigger encapsulates criteria that can be used to test an incoming email. A trigger has a name and one or more criteria tests, these can include:

* `--from`: the from address equals the given value
* `--sentto`: the address the incoming email has been sent to
* `--hasthewords`: the email body contains the text specified e.g. 'alert'
* `--domain`: the incoming email has a `from` address with the passed domain
* `--subjectcontains`: the email subject contains the text specified
* `--hasattachments`: the email has one or more attachments

To setup a trigger at the command line, provide a name and one or more criteria test (replacing `<username>`):

```shell
mailscript triggers:add \
  --name example-trigger \
  --from notifications@github.com \
  --sentto github@<username>.mailscript.com \
  --hasthewords build failed \
  --domain github.com \
  --subjectcontains PR \
  --hasattachments
```

#### Composing Triggers

Triggers allow you to name a criteria that can be used to filter incoming emails. Triggers can be logically composed to create new triggers, allowing for the sharing of complex conditional logic.

Two or more triggers can be composed together using either `and` or `or` logic:

* **and** - every criteria must be met for the composing trigger to be met
* **or** - one criteria from the `or` list must be met for the composing trigger to be met 

Assuming the following two triggers have been setup:

```shell
mailscript triggers:add \
  --name alert \
  --subjectcontains alert
  
mailscript triggers:add \
  --name error \
  --subjectcontains error
```

We can create a new trigger that combines both with:

```shell
mailscript triggers:add \
  --name alert-or-error \
  --or alert \
  --or error
```

In the example above `or` logic is used. If `and` logic was required (an email with a subject that contains `alert` AND `error` e.g. `alert: error in process`), the trigger composition would be:

```
mailscript triggers:add \
  --name alert-or-error \
  --and alert \
  --and error
```

### Actions

Mailscript offers automation outputs based on three different kinds of actions that can happen when a trigger is met:

- **Email actions**: send a new email message, forward the received email message, redirect the message to another address and reply to the sender or all participants in the received message.
- **SMS action**: send an sms text to a specified number.
- **Webhook action**: send a request to an endpoint. The request can be customized to suit your needs (eg. customize verbs, headers and payload; you can even use data from the received message into the delivered payload).

Actions can be combined together to create a new named action; for instance, if you want an SMS to be sent and a webhook to post to discord on receiving an email at `support@mycompany.mailscript.com`, you can create two separate named triggers for sms and webhook and a third combined trigger that does both.

#### Setting up Actions

Email actions of all types can be created at the command line and through the api.

All actions have a name, but they will have action type specific configuration options.

##### Email Actions

There are multiple email actions that can be setup to occur in response to an incoming email:

* forward - forward an email onto a new address as your email client would forward
* alias - redirect an email coming into the mailscript address to an external address, creating the effect that the email came from the originating address directly to the external address
* send - send a completely new email on to an external address (with the option to take parts of the triggering email over e.g. subject line)
* reply - respond to the incoming email, as if from the mailscript address that was sent to
* reply all - similar to reply but the response email is sent to everyong on the `cc` list as well

###### Forward

To create a forward action at the command line (replaceing `<username>`):

```shell
mailscript actions:add \
  --name forward-to-alice \
  --forward alice@example.com \
  --from <username>@mailscript.com
```

The `forward` parameter indicates the email address to forward on to. The `from` parameter indiciates which mailscript email address the relayed email will use for its `from` field.

###### Alias

To create an alias action at the command line:

```shell
mailscript actions:add \
  --name alias-to-personal \
  --alias myaccount@gmail.com
```

The `alias` specifies the email address the incoming email will be sent on to. You must verify that you control the email address. If you have not previously verified the email address, the `mailscript cli` will guide you through verification when you attempt to add the alias action.

###### Send

To send on an email with subject and body you specify, you can create a send alias at the command line (replacing `<username>`):

```shell
mailscript actions:add \
  --name send-test \
  --send jane@example.com \
  --from <username>@mailscript.com \
  --subject "Important: {{msg.subject}}" \
  --text "Please check discord for more information."
```

Send creates a bespoke email as specified and sends it to the email address passed as the `send` parameter. The `from` parameter indicates the mailscript address to use for the `from` field.

The subject line of the email is specified by the `subject` parameter, and has access to the string interpolation variables (i.e. `{{msg.subject}}`, `{{msg.text}}`, `{{msg.html}}`).

The body of the email must be specified, and can be passed either as plain test with `--text` or as html with `--html`.

###### Reply

A reply action responds back with an email to the incoming email. to create a reply action at the command line (replacing `<username>`):

```shell
mailscript actions:add \
  --name reply-test \
  --reply \
  --from <username>@mailscript.com \
  --text 'Out of office'
```

The `reply` indicates the type of action. Text or html must be specified to be prepended to the body of the reply email, using the `--text` or `--html` parameters respectively.

###### Reply All

A reply all action responds back with an email to the `from` address of the incoming email and to everyone in the `cc` list as well. To create a `reply all` action at the command line (replacing `<username>`):

```shell
mailscript actions:add \
  --name replyall-test \
  --replyall \
  --from <username>@mailscript.com \
  --text 'Out of office'
```

The `replyall` indicates the type of action. Text or html must be specified to be prepended to the body of the reply email, using the `--text` or `--html` parameters respectively.

##### SMS Action

To send an SMS message in response to an incoming message, setup an SMS action at the command line:

```shell
mailscript actions:add \
  --name sms-example \
  --sms +447747111111 \
  --text 'Important: {{msg.subject}}'
```

The phone number is provided with the `sms` parameters (include the international dialling code). Mailscript will ask you to verify the phone number if you have not already done so. The `text` parameter specifies the contents of the text and can include
interpolation variables derieved from teh incoming email (e.g. `{{msg.subject}}`,`{{msg.text}}`).

##### Webhook Action

To send an webhook in response to an incoming message, setup a Webhook action at the command line (replacing `<webhook-url>`):

```shell
mailscript actions:add \
  --name webhook-example \
  --webhook <webhook-url>
```

The url endpoint that will be `posted` to is given by the `webhook` parameter. There are three optional parameters:

* `--body` the path to a file that will be passed as the body, variable interpolation is available within this file e.g. `{{msg.subject}}` will substitute the incoming emails subject line.
* `--method` to override the http method from the default `POST`
* `--headers` the path to a file of valid json that will be passed as the headers of the webhook

#### Creating combined actions

We can combine two or more named actions into a new action with the combine command:

```shell
mailscript actions:combine \
  --name forward-and-sms \
  --action forward-to-alice \
  --action sms-example
```

The combined  `forward-and-sms` action can be used when setting up
a workflow as another action would be.

## Daemon

The Mailscript cli allows you to use your local machine, or a server, as an output for an action in a workflow.

Using the `mailscript daemon` command you can run a local daemon that will execute a script you specify as part of a `workflow` and in response to an email.

### Setting up a daemon

First register a new daemon action:

```shell
mailscript actions:add --name "action name" --daemon "daemon name"
```

We can now include the daemon in a workflow:

```shell
mailscript workflows:add \
  --name "workflow name" \
  --trigger "trigger name" \
  --action "daemon name"
```

Any email sent to the input and that matches the trigger, will be forwarded to the daemon listening on the `daemon name` action. To setup such a daemon run:

```shell
mailscript daemon \
  --daemon "daemon name"
  --command "cowsay \$subject"
```

The command parameter specifies the shell script to run when the workflow sends an email to the daemon action, in this case the `cowsay` utility. The contents of the email are made available through the `$subject` and `$text` environment variables. The command will be executed each time on each received email.