export const recursivelyModifyObjects = (
  data: any,
  objectModifier: (value: Record<string, any>) => Record<string, any>
): any => {
  if (Array.isArray(data)) {
    return data.map((value: any) =>
      recursivelyModifyObjects(value, objectModifier)
    )
  }
  if (data && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(objectModifier(data)).map(([key, value]) => [
        key,
        recursivelyModifyObjects(value, objectModifier),
      ])
    )
  }
  return data
}
