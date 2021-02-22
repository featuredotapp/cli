# keys

Configure keys for your email addresses

## `mailscript keys:add`

add an address key

```
USAGE
  $ mailscript keys:add

OPTIONS
  -a, --address=address  (required) the email address to look for keys against
  -h, --help             show CLI help
  -n, --name=name        (required) the name for the key
  -r, --read             set the key with read permissions
  -w, --write            set the key with write permissions
```

## `mailscript keys:delete`

delete an address key

```
USAGE
  $ mailscript keys:delete

OPTIONS
  -a, --address=address  (required) the email address to look for keys against
  -h, --help             show CLI help
  -k, --key=key          (required) the id of the address key
```

## `mailscript keys:list`

List the address keys for an address

```
USAGE
  $ mailscript keys:list

OPTIONS
  -a, --address=address  (required) the email address to look for keys against
  -h, --help             show CLI help
```

## `mailscript keys:update`

update an address key

```
USAGE
  $ mailscript keys:update

OPTIONS
  -a, --address=address  (required) the email address to look for keys against
  -h, --help             show CLI help
  -k, --key=key          (required) the id of the address key
  -n, --name=name        (required) the name for the key
  -r, --read             set the key with read permissions
  -w, --write            set the key with write permissions
```
