import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as databaseConfig from './database/config'
import { PostsModule } from './posts/posts.module'
import { UsersModule } from './users/users.module'
import { CommentsModule } from './comments/comments.module'

@Module({
  imports: [
    UsersModule,
    PostsModule,
    TypeOrmModule.forRoot(databaseConfig),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
      context: ({ req, res }) => ({ req, res }),
    }),
    CommentsModule,
  ],
})
export class AppModule {}
