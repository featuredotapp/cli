# Multiple triggers and actions combination

Mailscript allows you to combine multiple triggers and actions to provide functionality similar to AND/OR based statements. These can be accomplished in two different fashions by the general user.

### Table of Contents 
- [YML Example](#yml-example)
- [CLI setup](#cli-setup)
  - [Create triggers](#create-triggers)
  - [Create triggers](#wrap-it-up)

## YML example

The annotated YML workflow file doubles as a combined workflow example. You can view the YML file [here](annotated-workflow.yml)

## CLI setup
The second way this can be done is through the CLI.


### Create address
First, you need to setup a new mailscript address if you haven't done so already.
```
mailscript addresses:add \
  --address <name of choice>@mailscript.com
```
<hr/>

### Create triggers
Next we will configure two triggers, one that filters emails based on a 
subject that contains the word alert the other the word error:

```
mailscript triggers:add \
  --name alert \
  --subjectcontains alert
mailscript triggers:add \
  --name error \
  --subjectcontains error
```
Adjust the keywords in accordance to your use case. For example if your native language is different than English, these keywords would be the corresponding word in your language.

<hr/>
Next we must combine the two triggers. This would create a named trigger that combines the alert and error triggers. In the event an email contains a subject with the word alert or with the word error, the related action would be executed. This is using `or` logic to say if either of the composed triggers matches then the overall trigger matches:

```
mailscript triggers:add \
  --name alert-or-error \
  --or alert \
  --or error
```

If and logic was required (an email with a subject that contains `alert` AND `error` e.g. `alert: error in process`), the trigger composition would be:

```
mailscript triggers:add \
  --name alert-or-error \
  --and alert \
  --and error
```
<hr/>

### Create actions

We take a similar approach to actions, first creating two example webhook actions, one to a normal discord team channel the other to a discord engineering channel (replace and with appropriate webhooks):

```
mailscript actions:add \
  --name discord-team \
  --body ./body.json \
  --webhook <discord-team-channel-url>

mailscript actions:add \
  --name discord-engineering \
  --body ./body.json \
  --webhook <discord-engineering-channel-url>
```

Another example could be having one discord channel for errors and one for successes.

### Wrap it up
We can then combine the two actions into a single action list:

```
mailscript actions:combine \
  --name discord-team-and-engineering \
  --action discord-team \
  --action discord-engineering
```
Finally we can create a workflow that uses the composed trigger and the combined action (replace variables and other user supplied information where neccessary):

```
mailscript workflows:add \
  --name alerts-and-errors-to-team-and-engineering \
  --input <username>@.mailscript.com \
  --action discord-team-and-engineering
```