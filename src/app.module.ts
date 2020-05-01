import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import { getConnection } from 'typeorm'
import { CommentsModule } from './comments/comments.module'
import * as databaseConfig from './database/config'
import { PostsModule } from './posts/posts.module'
import { getTokenFromRequest, getUserIdFromToken } from './users/authentication'
import { User } from './users/user.entity'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    UsersModule,
    PostsModule,
    TypeOrmModule.forRoot(databaseConfig),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
      context: async ({ req, res }) => {
        const baseContext = { req, res }
        try {
          const token = getTokenFromRequest(req)
          if (!token) return baseContext
          const userId = await getUserIdFromToken(token!)
          const user = await getConnection().getRepository(User).findOne(userId)
          return {
            ...baseContext,
            user,
          }
        } catch (err) {
          return baseContext
        }
      },
    }),
    CommentsModule,
  ],
})
export class AppModule {}
