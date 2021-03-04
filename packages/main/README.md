<p align="center">
  <img src="./media/Mailscript_Black.png">
</p>
<p align="center">
  <H1>Low-code automation for inbound emails.</H1>
 <H4> Get a programmable email address. Automate what happens when you receive emails. It's like Zapier for devs who hate emails.</H4>
</p>

<div align="center">

<hr/>

[![Version](https://img.shields.io/npm/v/mailscript.svg)](https://npmjs.org/package/mailscript)
[![Downloads/week](https://img.shields.io/npm/dw/mailscript.svg)](https://npmjs.org/package/mailscript)
[![License](https://img.shields.io/npm/l/mailscript.svg)](https://github.com/mailscript/mailscript/blob/master/package.json)
![Main](https://github.com/mailscript/cli/workflows/Main/badge.svg)
[![codecov](https://codecov.io/gh/mailscript/cli/branch/main/graph/badge.svg)](https://codecov.io/gh/mailscript/cli)
[![GitHub Issues](https://img.shields.io/github/issues/mailscript/cli.svg)](https://github.com/mailscript/cli/issues)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)
[![Discord](https://img.shields.io/discord/475789330380488707?color=blueviolet&label=discord&style=flat-square)](https://discord.gg/US24HAVYq2)
<a href="https://twitter.com/intent/follow?screen_name=getmailscript">
  <img src="https://img.shields.io/twitter/follow/getmailscript.svg?label=Follow%20@getmailscript" alt="Follow @getmailscript" />
</a>

</div>

<p align="center">
  <a href="https://vimeo.com/514763976">
    <img src="docs/media/vimeo_video_min.png">
  </a>
<p>



# Table of Contents 📚
- [Table of Contents 📚](#table-of-contents-)
- [Features](#features)
  - [Use Cases](#use-cases)
  - [Getting Started 🚀](#getting-started-)
  - [Usage 👩‍💻](#usage-)
    - [Install through npm](#install-through-npm)
- [Commands ⌨](#commands-)
- [Development 💬](#development-)
- [License ⚖](#license-)

# Features
* Low code automations for your emails
* Create automations to filter and route emails as they hit your inbox.
* Create an infinte number of email addresses, and automate them individually.
* Parses *every element* of the email for you and provides a clean JSON object with all the metadata you will need.
* No need to transfer over to another email provider: Use your current email provider with Mailscript.
* Integrate your own custom coded email filters. Filter based on key words, or email header contents.
* Redirect high priority emails to your primary inbox, keeping it clean of clutter.

## Use Cases
* Send a text message to your phone upon receiving an important email
* Auto reply to first time senders.
* Save important attachments to a file server, or location of choice.

## Getting Started 🚀
* Read our [documentation](https://docs.mailscript.com/)
* Take a look at the [HTTP API documentation](https://api.mailscript.com/)

## Usage 👩‍💻
### Install through npm
In order to use the Mailscript CLI, you must first install it with the global flag. Run the following:
```sh-session
$ npm install -g mailscript
```
Alternatively, you could install the dev version *(not recommended!)*
```sh-session
$ npm install -g https://github.com/mailscript/cli.git
```
**Basic usage** 
```
$ mailscript COMMAND
running command...
$ mailscript (-v|--version|version)
mailscript/0.4.8 darwin-x64 node-v14.15.0
$ mailscript --help [COMMAND]
USAGE
  $ mailscript COMMAND
...
```
**Login via local daemon**
```sh-session
$ mailscript login
... 
You should see a browser window open prompting you to login to your Mailscript account. 
The daemon will handle the rest upon completion
```
# Commands ⌨
Ready to dive into Mailscript? [Read the command line documentation](https://github.com/mailscript/cli/tree/main/docs)

# Development 💬

Development information available [here](docs/develop.md) 

# License ⚖
CLI license: [MIT](https://github.com/mailscript/cli/blob/main/LICENSE)
