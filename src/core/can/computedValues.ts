import { IContext } from '../context'

export type ContextMapper<T> = (ctx: IContext) => T | undefined
type TransformFunction<T, U> = (t: T) => U | undefined


function transformContextMapper<T, U>(ctxGetter: ContextMapper<T>, transform: TransformFunction<T, U>): ContextMapper<U> {
  return ((ctx) => {
    const parentValue = ctxGetter(ctx)
    if (!parentValue) {
      return undefined
    }
    return transform(parentValue)
  })
}

export class ComputedValue<T> {
  constructor(private contextMapper: ContextMapper<T>) {}

  static Context = new ComputedValue((ctx) => ctx)
  static Now = new ComputedValue(() => new Date())
  static User = ComputedValue.Context.map(ctx => ctx.user)
  static UserId = ComputedValue.User.map(user => user.id)

  map<U>(transform: TransformFunction<T, U>): ComputedValue<U> {
    return new ComputedValue(transformContextMapper(this.contextMapper, transform))
  }

  get(context: IContext): T | undefined {
    return this.contextMapper(context)
  }
}
