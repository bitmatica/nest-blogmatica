import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { IContext } from '../core/context'

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx: IContext = GqlExecutionContext.create(context).getContext()
    return ctx.user
  },
)
