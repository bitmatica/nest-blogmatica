import { ForbiddenException } from '@nestjs/common'
import { Context, Resolver } from '@nestjs/graphql'
import { IContext } from '../core/context'
import { BASE_MODEL_FIELDS } from '../core/model'
import { Create } from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { ICreateModelInput, IMutationResponse } from '../core/resolvers/types'
import { Post } from './post.entity'
import { PostsService } from './posts.service'

type ICreatePostInput = Omit<ICreateModelInput<Post>, 'authorId'>
const CreatePostInput = Create.Input(Post, ['authorId', ...BASE_MODEL_FIELDS])

@Resolver(() => Post)
export class PostsResolver extends BaseModelResolver(Post, {
  service: PostsService,
  without: { Create },
}) {
  @Create.Decorator(Post)
  async create(
    @Create.Arg(Post, { type: CreatePostInput })
    input: ICreatePostInput,
    @Context() context: IContext,
  ): Promise<IMutationResponse<Post>> {
    const user = context.user
    if (!user) {
      throw new ForbiddenException()
    }

    const modifiedInput: ICreateModelInput<Post> = {
      ...input,
      authorId: user.id,
    }

    return this.service.create(modifiedInput, context)
  }
}
