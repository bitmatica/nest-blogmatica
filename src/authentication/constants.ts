export const jwtConstants = {
  secret: 'secretKey',
}

export const jwtServiceOptions = {
  secret: jwtConstants.secret,
  signOptions: { expiresIn: '15m' },
}

export const REFRESH_TOKEN_KEY = "refreshCookie"
