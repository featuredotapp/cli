# Mailscript templates: shared address for team

You can use this template to setup shared access to an address you control. Addresses use `scoped keys` (`read`/`write`) to be able to listen in to incoming messages and send messages from such address. By setting up redirects from an address an providing a `write-scoped key` to your peers you can easily setup a shared address.

## Workflow

```yml
version: "0.2"
addresses:
  team@$username.mailscript.com:
    keys:
      - name: Shared write key
        read: false
        write: true
      - name: owner
        read: true
        write: true
actions:
  - name: forward-to-alice
    type: mailscript-email
    config:
      type: forward
      forward: alice@example.com
      from: team@$username.mailscript.com
      key: owner
  - name: forward-to-jane
    type: mailscript-email
    config:
      type: forward
      forward: jane@example.com
      from: team@$username.mailscript.com
      key: owner
  - name: forward-to-brigit
    type: mailscript-email
    config:
      type: forward
      forward: brigit@example.com
      from: team@$username.mailscript.com
      key: owner
  - name: forward-to-team
    list:
      - forward-to-alice
      - forward-to-jane
      - forward-to-brigit
workflows:
  - name: redirect to team
    input: team@$username.mailscript.com
    action: forward-to-team
```

## Manual setup

Claim an address on your username's subdomain:

```sh
mailscript addresses:add --address shared@<username>.mailscript.com
```

Set forwards to external (existing) addresses (you'll have to verify ownership of such addresses):

```sh
mailscript actions:add \
  --name forward-to-alice \
  --forward alice@example.com \
  --from shared@<username>.mailscript.com

mailscript actions:add \
  --name forward-to-jane \
  --forward jane@example.com \
  --from shared@<username>.mailscript.com

mailscript actions:add \
  --name forward-to-brigit \
  --forward brigit@example.com \
  --from shared@<username>.mailscript.com

mailscript actions:combine \
  --name forward-to-team \
  --action forward-to-alice \
  --action forward-to-jane \
  --action forward-to-brigit
```

Setup a workflow to redirecting incoming emails at `shared@<username>.mailscript.com` to your team:

```sh
mailscript workflows:add \
  --name "redirect to team" \
  --input shared@<username>.mailscript.com
  --action forward-to-team
```

Create and get write key to share with peers:

```sh
mailscript keys:add \
  --address shared@username.mailscript.com \
  --name "Shared write key" \
  --write

mailscript keys:list --address shared@username.mailscript.com
```

## SMTP out configuration

Keys with `write` scope can be used as passwords for sending messages via Mailscript's `smtp` gateway. The following configuration parameters are needed to setup a Gmail client to be able to "send as" from a Mailscript address:

```
host: smtp.mailscript.com
port: 465
user: full-address@mailscript.com
pass: key-with-write-scope
```
