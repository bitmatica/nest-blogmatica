import { Resolver } from '@nestjs/graphql';
import { BaseModelResolver } from '../core/resolvers/model'
import { Comment } from './comment.entity'

@Resolver(of => Comment)
export class CommentsResolver extends BaseModelResolver(Comment) {}
