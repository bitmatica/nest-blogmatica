import { Resolver } from '@nestjs/graphql'
import { BASE_MODEL_FIELDS } from '../core/model'
import { Create } from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { Post } from './post.entity'
import { PostsService } from './posts.service'

const CreatePostInput = Create.Input(Post, ['authorId', ...BASE_MODEL_FIELDS])

@Resolver(() => Post)
export class PostsResolver extends BaseModelResolver(Post, {
  service: PostsService,
  with: {
    Create: new Create(Post, { input: CreatePostInput }),
  },
}) {}
