import { Resolver } from '@nestjs/graphql'
import { BASE_MODEL_FIELDS } from '../core/model'
import { Create } from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { Post } from './post.entity'
import { PostsService } from './posts.service'

const CreatePostInput = Create.Input(Post, ['authorId', ...BASE_MODEL_FIELDS])
const CustomCreate = new Create(Post, { input: CreatePostInput })

@Resolver(() => Post)
export class PostsResolver extends CustomCreate.build(
  BaseModelResolver(Post, {
    service: PostsService,
    without: { Create },
  }),
) {}
