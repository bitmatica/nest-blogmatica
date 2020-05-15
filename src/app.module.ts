import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PostsModule } from './posts/posts.module'
import { UsersModule } from './users/users.module'
import { CommentsModule } from './comments/comments.module'
import { OAuthModule } from './oauth/oauth.module'
import { GustoModule } from './gusto/gusto.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import oauthConfig from './config/oauthConfig'
import { UsersService } from './users/users.service'
import { graphqlConfigFactory } from './config/graphqlConfigFactory'
import databaseConfig from './config/databaseConfig'
import graphqlConfig from './config/graphqlConfig'
import cookieParser from 'cookie-parser'

@Module({
  imports: [
    CommentsModule,
    UsersModule,
    PostsModule,
    OAuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [oauthConfig, databaseConfig, graphqlConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('database'),
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
      path: '*', method: RequestMethod.ALL
    })
  }
}
