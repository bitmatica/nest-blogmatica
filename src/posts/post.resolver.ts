import { Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Resolver(of => Post)
export class PostsResolver {

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>
  ) {}

  @Query(returns => [Post])
  async posts(): Promise<Array<Post>> {
    return this.postRepository.find()
  }
}
