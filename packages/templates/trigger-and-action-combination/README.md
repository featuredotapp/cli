# Mailscript templates: trigger and actions combination

In Mailscript filtering emails based on a criteria can be captured as a `trigger`. This template demonstrates how to compose multiple named triggers together to create a new trigger. The combination of multiple actions into a new action is also shown.

## Workflow

```yml
version: "0.2"
addresses:
  combined-example@$username.mailscript.com:
    keys:
      - name: owner
        read: true
        write: true
triggers:
  - name: alert
    composition:
      - criteria:
          subjectContains: alert
  - name: error
    composition:
      - criteria:
          subjectContains: error
  - name: alert-or-error
    composition:
      - or:
          - alert
          - error
actions:
  - name: discord-team
    type: webhook
    config:
      body: '{"content": "A new email for the team: {{msg.subject}}"}'
      url: "https://discord.com/api/webhooks/..."
      opts:
        headers:
          Content-Type: application/json
        method: POST
  - name: discord-engineering
    type: webhook
    config:
      body: '{"content": "A new email for engineering: {{msg.subject}}"}'
      url: "https://discord.com/api/webhooks/..."
      opts:
        headers:
          Content-Type: application/json
        method: POST
  - name: discord-team-and-engineering
    list:
      - discord-team
      - discord-engineering
workflows:
  - name: alerts-and-errors-to-team-and-engineering
    input: combined-example@$username.mailscript.com
    trigger: alert-or-error
    action: discord-team-and-engineering
```

## Manual setup

Each of the elements in the config.yml above can be created with individual commands at the command line.

First, setup a new mailscript address specifically for dealing with github emails (replacing <username> text with your mailscript username):

```shell
mailscript addresses:add \
  --address combined-example@<username>.mailscript.com
```

Next we will configure two triggers, one that filters emails based on a subject that contains the word `alert` the other the word `error`:

```shell
mailscript triggers:add \
  --name alert \
  --subjectcontains alert

mailscript triggers:add \
  --name error \
  --subjectcontains error
```

We can use the combine functionality to create a named trigger that combines the alert and error triggers so that we can trigger when an email either contains a subject with the word `alert` or with the word `error`. This is using `or` logic to say if either of the composed triggers matches then the overall trigger matches:

```shell
mailscript triggers:add \
  --name alert-or-error \
  --or alert \
  --or error
```

If `and` logic was required (an email with a subject that contains 'alert' `AND` 'error' e.g. 'alert: error in process'), the trigger composition would be:

```shell
mailscript triggers:add \
  --name alert-or-error \
  --and alert \
  --and error
```

We take a similar approach to actions, first creating two example webhook actions, one to a nominal discord team channel the other to a discord engineering channel (replace <discord-team-channel-url> and <discord-engineering-channel-url> with appropriate webhooks):

```shell
mailscript actions:add \
  --name discord-team \
  --body ./body.json \
  --webhook <discord-team-channel-url>

mailscript actions:add \
  --name discord-engineering \
  --body ./body.json \
  --webhook <discord-engineering-channel-url>
```

We can then combine the two actions into a single action list:

```shell
mailscript actions:combine \
  --name discord-team-and-engineering \
  --action discord-team \
  --action discord-engineering
```

Finally we can create a workflow that uses the composed trigger and the combined action (replace <username>):

```shell
mailscript workflows:add \
  --name alerts-and-errors-to-team-and-engineering \
  --input combined-example@<username>.mailscript.com \
  --action discord-team-and-engineering
```
