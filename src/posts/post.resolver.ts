import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { DeletionResponse, PostInput, PostMutationResponse } from './types';

@Resolver(of => Post)
export class PostsResolver {

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>
  ) {}

  @Query(returns => [Post])
  async posts(): Promise<Array<Post>> {
    return this.postRepository.find()
  }

  @Query(returns => Post)
  async post(@Args('id', { type: () => ID }) id: string): Promise<Post | undefined> {
    return this.postRepository.findOne(id)
  }

  @Mutation(returns => PostMutationResponse)
  async createPost(@Args('input', { type: () => PostInput}) input: PostInput): Promise<PostMutationResponse> {
    try {
      const post = new Post()
      Object.assign(post, {...input})
      const saved = await this.postRepository.save(post)

      return {
        success: true,
        message: 'Post created.',
        post: saved
      }
    } catch (err) {
      return {
        success: false,
        message: err.message
      }
    }
  }

  @Mutation(returns => PostMutationResponse)
  async updatePost(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => PostInput}) input: PostInput,
  ): Promise<PostMutationResponse> {
    try {
      const post = await this.postRepository.findOne(id)
      Object.assign(post, {...input})
      await this.postRepository.save(post)
      return {
        success: true,
        message: 'Post updated.',
        post,
      }
    } catch (err) {
      return {
        success: false,
        message: err.message,
      }
    }
  }

  @Mutation(returns => DeletionResponse)
  async deletePost(@Args('id', { type: () => ID }) id: string): Promise<DeletionResponse> {
    try {
      const post = await this.postRepository.findOne(id)
      await this.postRepository.delete(post)
      return {
        success: true,
        message: 'Post deleted.'
      }
    } catch (err) {
      return {
        success: false,
        message: err.message
      }
    }
  }
}
