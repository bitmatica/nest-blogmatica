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

  map<U>(transform: TransformFunction<T, U>): ComputedValue<U> {
    return new ComputedValue(transformContextGetter(this.contextGetter, transform))
  }

  get(context: IContext): T | undefined {
    return this.contextGetter(context)
  }
}

export const ContextValue = new ComputedValue((ctx) => ctx)
export const NowValue = new ComputedValue(() => new Date())
export const UserValue = ContextValue.map(ctx => ctx.user)
export const UserIdValue = UserValue.map(user => user.id)
