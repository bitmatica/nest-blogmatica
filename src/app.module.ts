import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
// import * as databaseConfig from './database/config'
import { PostsModule } from './posts/posts.module'
import { UsersModule } from './users/users.module'
import { getConnection } from 'typeorm'
import { User } from './users/user.entity'
import { CommentsModule } from './comments/comments.module'
import { IContext } from './core/context'
import { ExtractJwt } from 'passport-jwt'
import { JwtPayload } from './authentication/strategies/jwt.strategy'
import { JwtService } from '@nestjs/jwt'
import { jwtServiceOptions } from './authentication/constants'
import { OAuthModule } from './oauth/oauth.module'
import { GustoModule } from './gusto/gusto.module'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    CommentsModule,
    UsersModule,
    PostsModule,
    OAuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres' as 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'blogmatica'),
        password: configService.get('DATABASE_PASS', 'blogmatica_password'),
        database: configService.get('DATABASE_DB', 'blogmatica'),
        synchronize: false,
        migrationsRun: false,
        logging: true,
        entities: [__dirname + '/**/*.entity.{js,ts}'],
        subscribers: [__dirname + '/**/*.subscriber.{js,ts}'],
        migrations: [__dirname + '/database/migrations/*.{js,ts}'],
        cli: {
          entitiesDir: 'src/**/models',
          migrationsDir: 'src/database/migrations',
        },
        extra: {
          connectionLimit: 5,
        },
      }),
    }),
    GraphQLModule.forRoot({
      playground: true, // TODO get from config
      introspection: true, // TODO get from config
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
    GustoModule,
  ],
})
export class AppModule {}
