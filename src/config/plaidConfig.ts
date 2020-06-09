export default () => ({
  plaid: {
    clientId: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    publicKey: process.env.PLAID_PUBLIC_KEY,
    products: process.env.PLAID_PRODUCTS || 'transactions',
    countryCodes: process.env.PLAID_COUNTRY_CODES || 'US',
    env: process.env.PLAID_ENV || 'sandbox',
  },
})

export interface IPlaidConfig {
  clientId: string
  secret: string
  publicKey: string
  products: string
  countryCodes: string
  env: string
}
