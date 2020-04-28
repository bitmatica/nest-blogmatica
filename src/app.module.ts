import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as databaseConfig from './database/config';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { getConnection } from 'typeorm';
import { User } from './users/user.entity';
import { getTokenFromRequest, getUserIdFromToken } from './users/authentication';

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
          const currentUser = await getConnection().getRepository(User).findOne(userId)
          return {
            ...baseContext,
            currentUser
          }
        } catch(err) {
          return baseContext
        }
      },
    }),
  ],
})
export class AppModule {}
