import { Resolver } from '@nestjs/graphql'
import { Delete } from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { Post } from './post.entity'


@Resolver(of => Post)
export class PostsResolver extends BaseModelResolver(Post, { without: [ Delete ] }) {}
