import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Post } from './post.entity'
import { PostsResolver } from './posts.resolver'

@Module({
  imports: [ TypeOrmModule.forFeature([ Post ]) ],
  providers: [ PostsResolver ],
})
export class PostsModule {}
