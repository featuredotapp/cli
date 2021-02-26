# Table of Contents
- [Development](#development)
- [Publish](#publish)

# Development

In development a `.env` file is used:
****
```shell
MAILSCRIPT_CONFIG_PATH=.mailscript-test # path to use for .mailscript config file
MAILSCRIPT_LOGIN_URL=http://localhost:3000 # login website url
MAILSCRIPT_API_SERVER=http://localhost:7000/v2 # api server url
MAILSCRIPT_EMAIL_DOMAIN=mailscript.io # the domain to use when assign email addresses
MAILSCRIPT_DAEMON_BRIDGE_URL=ws://localhost:8888 # the daemon bridge service
```

To run a command:

```shell
nvm use
node bin/run version
```

# Publish

Publishing the cli is a manual process.

First check that the cli passes tests and linting:

```shell
y format:check
y test
```

To publish, ensure you are on `main`. Then you will need the `team@mailscript` login to npm to publish:

```shell
npm login
npm version patch # or major or minor
git push
npm publish
```