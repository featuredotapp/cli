# workflows

Configure your workflows

## `mailscript workflows:add`

add a workflow

```
USAGE
  $ mailscript workflows:add

OPTIONS
  -a, --action=action    (required) name of the action accessory
  -h, --help             show CLI help
  -n, --name=name        (required) name of the workflow
  -o, --input=input      (required) name of the input
  -t, --trigger=trigger  name of the trigger accessory
  --workflow=workflow    id of the workflow to be acted on
```

## `mailscript workflows:delete`

delete a workflow

```
USAGE
  $ mailscript workflows:delete

OPTIONS
  -h, --help               show CLI help
  -w, --workflow=workflow  (required) id of the workflow to be acted on
```

## `mailscript workflows:list`

list the workflows

```
USAGE
  $ mailscript workflows:list
```
## `mailscript workflows:inspect`

Inspect a workflow

```
USAGE
  $ mailscript workflows:inspect ID

ARGUMENTS
  ID  id of the workflow

OPTIONS
  -e, --explicit  Show information that may compromise account security.
  -h, --help      show CLI help
  -v, --verbose   Verbose

```
