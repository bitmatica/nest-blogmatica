import { Type, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { Can } from './index'
import { ActionScope } from './scopes/action'

function NoAuthDecorator() {
  return
}

export function CanAuth<T>(classType: Type<T>, ...actionScopes: Array<ActionScope>) {
  return Can.checkRequiresAuthentication(classType, ...actionScopes)
    ? UseGuards(JwtAuthGuard)
    : NoAuthDecorator
}
