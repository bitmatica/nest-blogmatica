import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/post.module';
import * as databaseConfig from './database/config'

@Module({
  imports: [
    PostsModule,
    TypeOrmModule.forRoot(databaseConfig),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
    }),
  ],
})
export class AppModule {}
