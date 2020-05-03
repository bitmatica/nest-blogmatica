import { ForbiddenException } from '@nestjs/common'
import { Context, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IContext } from '../core/context'
import { BASE_MODEL_FIELDS } from '../core/model'
import { Create } from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { ICreateModelInput, IMutationResponse } from '../core/resolvers/types'
import { Post } from './post.entity'

type ICreatePostInput = Omit<ICreateModelInput<Post>, 'authorId'>
const CreatePostInput = Create.Input(Post, ['authorId', ...BASE_MODEL_FIELDS])

@Resolver(() => Post)
export class PostsResolver extends BaseModelResolver(Post, { Create }) {
  @InjectRepository(Post)
  repo: Repository<Post>

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

    return Create.Resolver(Post)(this.repo, modifiedInput, context)
  }
}
