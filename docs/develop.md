# Development

The cli is node app built on the `oclif` command line framework.

To install dependencies, run yarn in the root:

```sh
yarn
```

In development a `.env` file is used:

```shell
MAILSCRIPT_CONFIG_PATH=.mailscript-test # override path to use for .mailscript config file
MAILSCRIPT_LOGIN_URL=http://localhost:3000 # login website url
MAILSCRIPT_API_SERVER=http://localhost:7000/v2 # api server url
MAILSCRIPT_EMAIL_DOMAIN=mailscript.io # the domain to use when assign email addresses (mailscript.io in development)
MAILSCRIPT_DAEMON_BRIDGE_URL=ws://localhost:8888 # the daemon bridge service endpoint
```

If a `.env` file is not used, the cli will use the default live values.

To run a command:

```shell
node bin/run version
```

## Publishing

To publish to npm, ensure you are on the main branch and that all tests pass. Then run increment the version and publish:

```
yarn test
npm version patch # or minor or major
npm publish
```