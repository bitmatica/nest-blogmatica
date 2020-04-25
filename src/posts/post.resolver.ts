import { Resolver } from '@nestjs/graphql';
import { BaseModelResolver } from '../common/resolver';
import { Post } from './post.entity';


@Resolver(of => Post)
export class PostsResolver extends BaseModelResolver(Post) {}
