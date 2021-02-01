<p align="center">
  <img src="docs/media/Mailscript_Black.png">
</p>
<p align="center">
MailScript cli
<hr/>
</p>
<div align="center">

### Configure and use mailscript from the command-line

<hr/>

[![Version](https://img.shields.io/npm/v/mailscript.svg)](https://npmjs.org/package/mailscript)
[![Downloads/week](https://img.shields.io/npm/dw/mailscript.svg)](https://npmjs.org/package/mailscript)
[![License](https://img.shields.io/npm/l/mailscript.svg)](https://github.com/mailscript/mailscript/blob/master/package.json)
[![Discord](https://img.shields.io/discord/475789330380488707?color=blueviolet&label=discord&style=flat-square)](https://discord.gg/US24HAVYq2)
![Main](https://github.com/mailscript/cli/workflows/Main/badge.svg)

</div>

<p align="center">
  <a href="https://vimeo.com/489472356">
    <img src="docs/media/ms_1.png">
  </a>
<p>

# Table of Contents
<!-- toc -->
* [Features](#features)
* [Getting started](#getting-started)
* [Usage](#usage)
* [Commands](#commands)
* [Development](#development)
* [License](#license)

# Features
* Low code automations for filtering/directing your emails
* Create an infinte number of email addresses for your use case.
* Integrate your own custom coded email filters with mailscript
* Filter based on key words, or email header contents. Mailscript does the heavy lifting of email parsing for you. Providing a clean JSON object with all the metadata you will need.
* No need to transfer over to another email provider: Use your current email provider with mailscript. Mailscript will redirect high priority emails to your primary inbox. Keeping your inbox clean of clutter.

## Getting Started
* Read the [docs](https://docs.mailscript.com/)
* Take a look at the [HTTP API docs](https://api.mailscript.com/)

<!-- tocstop -->
## Usage
<!-- usage -->
### Install through npm
In order to use the mailscript CLI must first install it wth the global flag. Run the following...
```sh-session
$ npm install -g mailscript
```
Or you could install dev version (Not recommended)
```sh-session
$ npm install -g https://github.com/mailscript/cli.git
```
**Basic usage**
```
**Login local daemon**
```sh-session
$ mailscript login
... You should see a browser window open prompting you to login to your mailscript account. The daemon will handle the rest upon completion
```
<!-- usagestop -->
# Commands
Ready to dive into mailscript? [Read the commandline documentation](https://github.com/mailscript/cli/tree/main/docs)
<!-- commands -->

# Development

Development information available [here](docs/develop.md) 

# License
CLI license: [MIT](https://github.com/mailscript/cli/blob/main/LICENSE)