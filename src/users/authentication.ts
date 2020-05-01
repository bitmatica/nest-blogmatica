import Express from 'express'
import * as JWT from 'jsonwebtoken'
import { DateTime } from 'luxon'

export const AUTH_TOKEN_COOKIE = 'AUTH_TOKEN'

export const setTokenCookie = (res: Express.Response, token: string) => {
  res.cookie(AUTH_TOKEN_COOKIE, token)
}

export const clearTokenCookie = (res: Express.Response) => {
  res.clearCookie(AUTH_TOKEN_COOKIE)
}
