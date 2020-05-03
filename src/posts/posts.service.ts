import { Injectable } from '@nestjs/common'
import { BaseModelService } from '../core/service/model'
import { Post } from './post.entity'

@Injectable()
export class PostsService extends BaseModelService(Post) {}
