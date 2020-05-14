import { registerAs } from '@nestjs/config'

export default registerAs('graphql', () => ({
  playground: process.env.GRAPHQL_ENABLE_PLAYGROUND || process.env.NODE_ENV != 'production',
  introspection: process.env.GRAPHQL_ENABLE_INTROSPECTION || process.env.NODE_ENV != 'production',
}))
