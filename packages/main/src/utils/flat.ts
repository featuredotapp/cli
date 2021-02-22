export function flat(arr: any, depth = 10): any {
  return arr.reduce(function (acc: any, toFlatten: any) {
    return acc.concat(
      Array.isArray(toFlatten) && depth > 1
        ? flat(toFlatten, depth - 1)
        : toFlatten,
    )
  }, [])
}
