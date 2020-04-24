import { Resolver } from '@nestjs/graphql';
import { BaseResolver } from '../common/resolver';
import { Post } from './post.entity';


@Resolver(of => Post)
export class PostsResolver extends BaseResolver(Post) {}
