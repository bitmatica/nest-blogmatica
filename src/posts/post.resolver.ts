import { Resolver } from '@nestjs/graphql'
import { Delete } from '../common/resolvers/actions'
import { BaseModelResolver } from '../common/resolvers/model'
import { Post } from './post.entity'


@Resolver(of => Post)
export class PostsResolver extends BaseModelResolver(Post, { without: [ Delete ] }) {}
