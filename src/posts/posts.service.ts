import { Injectable } from '@nestjs/common'
import { GraphQLResolveInfo } from 'graphql'
import { IContext } from '../core/context'
import { BaseModelService } from '../core/service/model'
import { Post } from './post.entity'

@Injectable()
export class PostsService extends BaseModelService(Post) {
  list(
    context: IContext,
    info: GraphQLResolveInfo,
  ): Promise<Array<Post>> | Array<Post> {
    console.log('Posts List Override')
    return super.list(context, info)
  }
}
