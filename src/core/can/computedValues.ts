import { IContext } from '../context'

export type ContextGetter<T> = (ctx: IContext) => T | undefined
type TransformFunction<T, U> = (t: T) => U | undefined


function transformContextGetter<T, U>(ctxGetter: ContextGetter<T>, transform: TransformFunction<T, U>): ContextGetter<U> {
  return ((ctx) => {
    const parentValue = ctxGetter(ctx)
    if (!parentValue) {
      return undefined
    }
    return transform(parentValue)
  })
}

export class ComputedValue<T> {
  constructor(private contextGetter: ContextGetter<T>) {}

  static Context = new ComputedValue((ctx) => ctx)
  static Now = new ComputedValue(() => new Date())
  static User = ComputedValue.Context.map(ctx => ctx.user)
  static UserId = ComputedValue.User.map(user => user.id)

  map<U>(transform: TransformFunction<T, U>): ComputedValue<U> {
    return new ComputedValue(transformContextGetter(this.contextGetter, transform))
  }

  get(context: IContext): T | undefined {
    return this.contextGetter(context)
  }
}
