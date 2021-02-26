# Mailscript templates: email infrastructure

You can use this setup to manage a team's email infrastructure: define individual email addresses, define team addresses, define email routing, configure notifications to other channels, etc.

## Usage

The two important files are `config.yml` and `deploy.yml`.

- `config.yml` defines the Mailscript setup
- `deploy.yml` defines a GitHub action to sync changes to the Mailscript's db whenever it is run.

The config.yml contains the variables `$username`, which will substitute you mailscript username (i.e. <username>@mailscript.com), and `$account-email-address` which will substitute the email address used when signing up to mailscript. Replace the `$account-email-address` variable if you would like to use a different address.

We recommend using the `deploy.yml` file in a GitHub action when changes are pushed to a repo's `main` branch.

## API_KEY

`deploy.yml` expects a secret value for `API_KEY`. This is the same token you get when you complete the login flow in the CLI using the `--offline` parameter (`mailscript login --offline`).

### .env

This repo includes a `.env` file to tell the CLI where to find the file with the `API_KEY` so it should be included in your own repo to ensure the sync process is successful.

## Considerations

**aliases**

Before being able to configure redirections to a different address it has to be verified, or else the sync will error. To do so you have to manually trigger the creation of a workflow setting a redirect to this address:

```sh
mailscript actions:add \
  --name email-alias-to-external-address \
  --alias external@example.com 

mailscript workflows:add \
  --name "redirect to external@example.com" \
  --input <username>@mailscript.com \
  --trigger address@mailscript.com \
  --alias email-alias-to-external-address
```

The previous command will trigger a verify process. Once you've successfully verified the external address you account will be able to use it for all redirects - and the automatic sync will complete.
