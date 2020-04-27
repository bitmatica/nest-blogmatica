import { Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  Create,
  CreateModelArgs,
  CreateModelResolver,
  defaultCreateModelInput,
  defaultCreateModelMutation,
  defaultModelCreationResponse,
} from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { ICreateModelInput, IMutationResponse } from '../core/resolvers/types'
import { Post } from './post.entity'

const creationResponse = defaultModelCreationResponse(Post)
const inputType = defaultCreateModelInput(Post)

@Resolver(of => Post)
export class PostsResolver extends BaseModelResolver(Post, { without: [ Create ] }) {
  @InjectRepository(Post)
  repo: Repository<Post>

  @CreateModelResolver(Post, creationResponse)
  async create(@CreateModelArgs(Post, inputType) input: ICreateModelInput<Post>): Promise<IMutationResponse<Post>> {
    return defaultCreateModelMutation(Post, this.repo, input)
  }
}
