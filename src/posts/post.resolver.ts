import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseResolver } from '../common/resolver';
import { User } from '../users/user.entity';
import { Post } from './post.entity';


@Resolver(of => Post)
export class PostsResolver extends BaseResolver(Post) {

  @InjectRepository(User)
  userRepo: Repository<User>

  @ResolveField(type => User)
  async author(@Parent() post: Post): Promise<User> {
    return (await this.userRepo.findOne(post.authorId, { cache: 1000 }))!
  }
}
