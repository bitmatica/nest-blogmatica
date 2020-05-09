import { HttpModule, Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as databaseConfig from './database/config'
import { PostsModule } from './posts/posts.module'
import { UsersModule } from './users/users.module'
import { getConnection } from 'typeorm'
import { User } from './users/user.entity'
import { CommentsModule } from './comments/comments.module'
import { OAuthController } from './oauth/oauth.controller'
import { IContext } from './core/context'
import { ExtractJwt } from 'passport-jwt'
import { JwtPayload } from './authentication/strategies/jwt.strategy'
import { JwtService } from '@nestjs/jwt'
import { jwtServiceOptions } from './authentication/constants'
import { GustoController } from './gusto/gusto.controller'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

@Module({
  imports: [
    UsersModule,
    PostsModule,
    TypeOrmModule.forRoot(databaseConfig),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
      context: async ({ req, res }): Promise<IContext> => {
        const baseContext = { req, res }
        try {
          /*
          - Check for presence of Authorization header.  If not there, only set req, res and return
          - If Authorization header exists, validate token and find user.  If anything fails, throw "Unauthorized"
          - If authentication passes, place user on context.req
           */
          const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
          if (!token) {
            return baseContext
          }
          const jwtService = new JwtService(jwtServiceOptions)
          const payload: JwtPayload = jwtService.verify(token)
          const user = await getConnection()
            .getRepository(User)
            .findOne({ id: payload.sub })
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
    }),
    CommentsModule,
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/rest*', '/graphql*'],
    }),
  ],
  controllers: [OAuthController, GustoController],
})
export class AppModule {}
