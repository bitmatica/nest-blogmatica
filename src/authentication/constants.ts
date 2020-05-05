export const jwtConstants = {
  secret: 'secretKey',
}

export const jwtServiceOptions = {
  secret: jwtConstants.secret,
  signOptions: { expiresIn: '60m' },
}
