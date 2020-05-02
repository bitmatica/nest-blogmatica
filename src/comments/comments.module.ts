import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comment } from './comment.entity'
import { CommentsResolver } from './comments.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentsResolver],
})
export class CommentsModule {}
