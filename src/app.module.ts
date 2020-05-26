import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import cookieParser from 'cookie-parser'
import { join } from 'path'
import { AuthenticationModule } from './authentication/authentication.module'
import { CommentsModule } from './comments/comments.module'
import databaseConfig from './config/databaseConfig'
import graphqlConfig from './config/graphqlConfig'
import { graphqlConfigFactory } from './config/graphqlConfigFactory'
import oauthConfig from './config/oauthConfig'
import { AdminModule } from './core/admin/admin.module'
import { getOrThrow } from './core/utils'
import { GustoModule } from './gusto/gusto.module'
import { OAuthModule } from './oauth/oauth.module'
import { PostsModule } from './posts/posts.module'
import { UsersModule } from './users/users.module'
import { UsersService } from './users/users.service'
import { GraphQLModule } from '@nestjs/graphql'

@Module({
  imports: [
    AdminModule,
    CommentsModule,
    UsersModule,
    PostsModule,
    OAuthModule,
    AuthenticationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [oauthConfig, databaseConfig, graphqlConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getOrThrow(
          configService.get<TypeOrmModuleOptions>('database'),
          'Database config was not found',
        ),
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, UsersModule],
      inject: [ConfigService, UsersService],
      useFactory: graphqlConfigFactory,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/auth*', '/graphql*', '/authCallback'],
    }),
    GustoModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    })
  }
}
