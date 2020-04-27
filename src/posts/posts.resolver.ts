import { Type } from '@nestjs/common'
import { InputType, OmitType, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FAKE_CURRENT_USER } from '../core/can'
import { Create, CreateModelArgs, CreateModelResolver, defaultCreateModelMutation } from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { ICreateModelInput, IMutationResponse } from '../core/resolvers/types'
import { Post } from './post.entity'

@InputType()
class CreatePostInput extends OmitType(Post as Type<any>, [ 'id', 'created', 'updatedAt', 'authorId', 'authors' ], InputType) {}

@Resolver(of => Post)
export class PostsResolver extends BaseModelResolver(Post, { without: [ Create ] }) {
  @InjectRepository(Post)
  repo: Repository<Post>

  @CreateModelResolver(Post)
  async create(@CreateModelArgs(Post) input: ICreateModelInput<Post>): Promise<IMutationResponse<Post>> {
    const user = FAKE_CURRENT_USER
    const modifiedInput: ICreateModelInput<Post> = {
      ...input,
      authorId: user.id,
    }
    return defaultCreateModelMutation(Post, this.repo, modifiedInput)
  }
}
