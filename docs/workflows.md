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
