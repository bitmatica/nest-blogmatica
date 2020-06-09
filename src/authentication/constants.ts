export const jwtConstants = {
  secret: 'secretKey',
}

export const jwtServiceOptions = {
  secret: jwtConstants.secret,
  signOptions: { expiresIn: '15m' },
}

export const REFRESH_TOKEN_KEY = "refreshCookie"

export const DAYS_AFTER_LOGIN_REFRESH_TOKEN_EXPIRY = 2
export const UPDATE_EXPIRY_ON_TOKEN_REFRESH = false
export const DAYS_AFTER_ACTIVITY_REFRESH_TOKEN_EXPIRY = 0
