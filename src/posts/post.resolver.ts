import { Resolver } from '@nestjs/graphql'
import { Delete } from '../common/resolver/actions'
import { BaseResolver } from '../common/resolver/model'
import { Post } from './post.entity'


@Resolver(of => Post)
export class PostsResolver extends BaseResolver(Post, { without: [ Delete ] }) {}
