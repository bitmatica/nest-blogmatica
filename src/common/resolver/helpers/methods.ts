export function decorateMethod(classPrototype: any, propertyKey: string | symbol, decorator: MethodDecorator) {
  const desc = Object.getOwnPropertyDescriptor(classPrototype, propertyKey)
  const wrappedDesc = decorator(classPrototype, propertyKey, desc)
  if (wrappedDesc) {
    Object.defineProperty(classPrototype, propertyKey, wrappedDesc)
  }
}

export function addMethod(classPrototype: any, propertyKey: string | symbol, fn: Function) {
  classPrototype[propertyKey] = fn
}

export declare type TypeValue = ((type?: any) => Function) | Function | string

export function extractTypeName(relationType: TypeValue): string {
  if (typeof relationType === "string") {
    return relationType
  }

  if (relationType.name) {
    return relationType.name
  }

  return relationType().name
}
