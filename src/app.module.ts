import { Module } from '@nestjs/common'
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
import { databaseConfigFactory } from './config/databaseConfigFactory'
import oauth from './config/oauth'
import { UsersService } from './users/users.service'
import { graphqlConfigFactory } from './config/graphqlConfigFactory'

@Module({
  imports: [
    CommentsModule,
    UsersModule,
    PostsModule,
    OAuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [oauth],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseConfigFactory,
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, UsersModule],
      inject: [ConfigService, UsersService],
      useFactory: graphqlConfigFactory,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/oauth*', '/graphql*', '/authCallback'],
    }),
    GustoModule,
  ],
})
export class AppModule {}
