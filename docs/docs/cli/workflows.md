# workflows

Configure your workflows

### Index
- [mailscript workflows:add](#mailscript-workflows:add)
- [mailscript workflows:delete](#mailscript-workflows:delete)
- [mailscript workflows:list](#mailscript-workflows:list)
- [mailscript workflows:inspect](#mailscript-workflows:inspect)
- [mailscript workflows:active](#mailscript-workflows:active)
- [mailscript workflows:set](#mailscript-workflows:set)


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
## `mailscript workflows:active`

Retrieve whether a workflow is enabled or not; Optionally enable/disable a workflow.

```
USAGE
  $ mailscript workflows:active ID [VALUE]

ARGUMENTS
  ID     id of the workflow to be acted on
  VALUE  "on" or "off"

OPTIONS
  -h, --help  show CLI help

```
## `mailscript workflows:set`

Set a property of a workflow

```
USAGE
  $ mailscript workflows:set ID KEY VALUE

ARGUMENTS
  ID     id of the workflow to be acted on
  KEY    key of the property
  VALUE  value of the property

OPTIONS
  -h, --help       show CLI help
  -t, --type=type  type of the value
```
