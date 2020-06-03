import { ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import { IContext } from '../core/context'
import { ExtractJwt } from 'passport-jwt'
import { JwtService } from '@nestjs/jwt'
import { jwtServiceOptions, REFRESH_TOKEN_KEY } from '../authentication/constants'
import { JwtPayload } from '../authentication/strategies/jwt.strategy'
import { AuthenticationService } from '../authentication/authentication.service'

export const graphqlConfigFactory = async (
  configService: ConfigService,
  usersService: UsersService,
  authService: AuthenticationService,
) => ({
  playground: configService.get<boolean>('graphql.playground'),
  cors: false,
  introspection: configService.get<boolean>('graphql.introspection'),
  installSubscriptionHandlers: true,
  autoSchemaFile: 'schema.gql',
  context: async ({ ...input }): Promise<IContext> => {
    const { req, res } = input
    const baseContext = { req, res }
    try {
      /*
        - Check for presence of Authorization header.  If not there, only set req, res and return
        - If Authorization header exists, validate token and find user.  If anything fails, throw "Unauthorized"
        - If authentication passes, place user on context.req
         */

      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
      let user
      if (token) {
        const jwtService = new JwtService(jwtServiceOptions)
        const payload: JwtPayload = jwtService.verify(token)
        user = await usersService.getById(payload.sub)
      } else {
        user = await authService.getUserByRefreshToken(baseContext.req.cookies[REFRESH_TOKEN_KEY])
      }

      if (!user) {
        return baseContext
      }

      return {
        req: {
          ...req,
          user,
        },
        res,
      }
    } catch (err) {
      // TODO throwing here leads to context creation failure.
      //  Figure out how to throw an UnauthorizedException but let context creation succeed.
      return baseContext
    }
  },
})
