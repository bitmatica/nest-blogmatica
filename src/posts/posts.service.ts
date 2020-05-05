import { ForbiddenException, Injectable } from '@nestjs/common'
import { GraphQLResolveInfo } from 'graphql'
import { IContext } from '../core/context'
import { ICreateModelInput, MutationResponse } from '../core/resolvers/types'
import { BaseModelService } from '../core/service/model'
import { Post } from './post.entity'

@Injectable()
export class PostsService extends BaseModelService(Post) {
  create(
    input: ICreateModelInput<Post>,
    context: IContext,
    info?: GraphQLResolveInfo,
  ): Promise<MutationResponse<Post>> | MutationResponse<Post> {
    const user = context.req.user
    if (!user) {
      throw new ForbiddenException()
    }

    const modifiedInput: ICreateModelInput<Post> = {
      ...input,
      authorId: user.id,
    }

    return super.create(modifiedInput, context, info)
  }
}
