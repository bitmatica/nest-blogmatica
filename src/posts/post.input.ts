import { Field, InputType, ObjectType, OmitType, PartialType } from '@nestjs/graphql';
import { MutationResponse } from '../common/types';
import { Post } from './post.entity'

@InputType()
export class PostInput extends PartialType(OmitType(Post, ['id']), InputType) {}

