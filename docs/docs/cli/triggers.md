# triggers

Configure your triggers

## `mailscript triggers:add`

add a trigger

```
USAGE
  $ mailscript triggers:add

OPTIONS
  -h, --help                         show CLI help
  -n, --name=name                    (required) name of the trigger
  --and=and                          combine sub-triggers into a new trigger with "and" logic
  --domain=domain                    constrain trigger to emails are from an email address with the given domain
  --equals=equals                    the value used against the property param
  --exists                           whether the property param exists
  --firsttimesender                  constrain trigger to emails that are the first seen from the sending address
  --from=from                        constrain trigger to emails from the specified address
  --hasattachments                   constrain trigger to emails with attachments
  --hasthewords=hasthewords          constrain trigger to emails that have the words specified
  --not                              invert the property param match
  --or=or                            combine sub-triggers into a new trigger with "or" logic
  --property=property                constrain trigger to emails where the property matches, use with --equals
  --seconds=seconds                  period of time to calculate the trigger over
  --sentto=sentto                    constrain trigger to emails sent to the specified address
  --subjectcontains=subjectcontains  constrain trigger to emails whose subject contains the specified text
  --times=times                      number of emails in a period for trigger to activate
```

## `mailscript triggers:delete`

delete a trigger

```
USAGE
  $ mailscript triggers:delete

OPTIONS
  -h, --help             show CLI help
  -t, --trigger=trigger  (required) id of the trigger to be acted on
```

## `mailscript trigger:list`

list the triggers

```
USAGE
  $ mailscript triggers:list

OPTIONS
  -h, --help  show CLI help

```
