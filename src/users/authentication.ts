import Express from 'express'
import * as JWT from 'jsonwebtoken'
import { DateTime } from 'luxon'

export const AUTH_TOKEN_COOKIE = 'AUTH_TOKEN'
export const AUTH_TOKEN_VERSION = 1

interface IJWTPayload {
  version: number
  userId: string
  createdAt: number
}

export const getSigningToken = (): Promise<string> => {
  return Promise.resolve('OVERRIDE_ME')
}

export const setTokenCookie = (res: Express.Response, token: string) => {
  res.cookie(AUTH_TOKEN_COOKIE, token)
}

export const clearTokenCookie = (res: Express.Response) => {
  res.clearCookie(AUTH_TOKEN_COOKIE)
}

export const getTokenFromCookie = (req: Express.Request): string | undefined => {
  return req.cookies[AUTH_TOKEN_COOKIE]
}

export const getTokenFromHeader = (req: Express.Request): string | undefined => {
  return req.header('Authorization')?.replace('Bearer ', '')
}

export const getTokenFromRequest = (req: Express.Request): string | undefined => {
  return getTokenFromHeader(req) || getTokenFromCookie(req)
}

export const getUserIdFromToken = async (token: string): Promise<string | undefined> => {
  const secret = await getSigningToken()
  const payload: IJWTPayload = JWT.verify(token, secret) as IJWTPayload
  const tokenExpiration = payload.createdAt || 0

  if (DateTime.utc() > DateTime.fromMillis(tokenExpiration).plus({ hours: 12 })) {
    return undefined
  }
  return payload.userId
}

export const generateTokenForUserId = async (userId: string): Promise<string> => {
  const secret = await getSigningToken()
  const payload: IJWTPayload = {
    version: AUTH_TOKEN_VERSION,
    userId,
    createdAt: DateTime.utc().valueOf(),
  }
  return JWT.sign(payload, secret)
}
