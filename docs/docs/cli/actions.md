# actions

Configure your actions

## `mailscript actions:add`

add an action

```
USAGE
  $ mailscript actions:add

OPTIONS
  -f, --forward=forward    email address for forward action
  -h, --help               show CLI help
  -n, --name=name          (required) name of the action
  -r, --reply              reply to incoming email
  -s, --subject=subject    subject of the email
  -w, --webhook=webhook    url of the webhook to call
  --alias=alias            email address for alias action
  --body=body              file to take webhook body from
  --daemon=daemon          the name of the daemon to send to
  --from=from              email address to use as sending from
  --headers=headers        file to take webhook headers from
  --html=html              html of the email
  --method=(PUT|POST|GET)  [default: POST] HTTP method to use in webhook
  --noninteractive         do not ask for user input
  --replyall               reply all to incoming email
  --send=send              email address for send action
  --sms=sms                the sms number to send to
  --text=text              text of the email
```

## `mailscript actions:combine`

create an action by combining other actions

```
USAGE
  $ mailscript actions:combine

OPTIONS
  -h, --help       show CLI help
  --action=action  (required) Action to combine
  --name=name      (required) the name of the new actions
```

## `mailscript actions:list`

list the actions

```
USAGE
  $ mailscript actions:list

OPTIONS
  -h, --help  show CLI help
```

## `mailscript actions:inspect`

Inspect an action

```
USAGE
  $ mailscript actions:inspect ID

ARGUMENTS
  ID  id of the action

OPTIONS
  -h, --help      show CLI help
```
