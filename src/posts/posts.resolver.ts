import { ForbiddenException } from '@nestjs/common'
import { Context, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IContext } from '../core/context'
import { BASE_MODEL_FIELDS } from '../core/model'
import {
  Create,
  CreateModelArgs,
  CreateModelMutation,
  defaultCreateModelInput,
  defaultCreateModelMutation,
} from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { ICreateModelInput, IMutationResponse } from '../core/resolvers/types'
import { Post } from './post.entity'

const CreatePostInput = defaultCreateModelInput(Post, [
  'authorId',
  ...BASE_MODEL_FIELDS,
])

@Resolver(() => Post)
export class PostsResolver extends BaseModelResolver(Post, {
  without: [Create],
}) {
  @InjectRepository(Post)
  repo: Repository<Post>

  @CreateModelMutation(Post)
  async create(
    @CreateModelArgs(Post, { type: CreatePostInput })
    input: ICreateModelInput<Post>,
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
    return defaultCreateModelMutation(Post, this.repo, modifiedInput, context)
  }
}
