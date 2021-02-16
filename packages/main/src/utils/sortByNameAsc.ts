interface EntityWithName {
  name: string
}

export default function sortByNameDesc(a: EntityWithName, b: EntityWithName) {
  return a.name.localeCompare(b.name)
}
