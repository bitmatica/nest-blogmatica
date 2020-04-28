import { InputType, OmitType, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FAKE_CURRENT_USER } from '../core/can'
import { Create, CreateModelArgs, CreateModelMutation, defaultCreateModelMutation } from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { ICreateModelInput, IMutationResponse } from '../core/resolvers/types'
import { Post } from './post.entity'

@InputType()
class CreatePostInput extends OmitType(Post, [ 'id', 'author', 'createdAt', 'updatedAt', 'authorId' ], InputType) {}

@Resolver(of => Post)
export class PostsResolver extends BaseModelResolver(Post, { without: [ Create ] }) {
  @InjectRepository(Post)
  repo: Repository<Post>

  @CreateModelMutation(Post)
  async create(@CreateModelArgs(Post, { type: CreatePostInput }) input: ICreateModelInput<Post>): Promise<IMutationResponse<Post>> {
    const user = FAKE_CURRENT_USER
    const modifiedInput: ICreateModelInput<Post> = {
      ...input,
      authorId: user.id,
    }
    return defaultCreateModelMutation(Post, this.repo, modifiedInput)
  }
}
