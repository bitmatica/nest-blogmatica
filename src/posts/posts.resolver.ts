import { ForbiddenException, Type } from '@nestjs/common'
import { Query, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { getConnection, Repository } from 'typeorm'
import { Comment } from '../comments/comment.entity'
import { FAKE_CURRENT_USER, UserScope } from '../core/can';
import { BASE_MODEL_FIELDS } from '../core/model'
import {
  Create,
  CreateModelArgs,
  CreateModelMutation,
  defaultCreateModelInput,
  defaultCreateModelMutation,
} from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { ICreateModelInput, IMutationResponse } from '../core/resolvers/types'
import { Post } from './post.entity'
import { User } from '../users/user.entity';

const CreatePostInput = defaultCreateModelInput(Post, [ 'authorId', ...BASE_MODEL_FIELDS ])

// can edit comments where comment.authorId == userId OR comment.post.authorId == userId
/*
  user => {
    return {
      authorId: user.id
    }
  }

  user => {
    return {
      post: {
        authorId: user.id
      }
    }
  }
 */
//
// type CanAccessFunction<TModel, K extends keyof TModel> = (className: Type<TModel>, where: Record<K, string>) => string
//
// function canAccess<TModel, K extends keyof TModel, U, Y extends keyof U>(className: Type<TModel>, where: Record<Y, CanAccessFunction<U, any>> | Record<K, string>) {
//   return ''
// }


// type CanAccessFunction<TModel, K extends keyof TModel> = (className: Type<TModel>, where: Record<K, string>) => string

function canAccess<TModel>(className: Type<TModel>, where: Record<keyof TModel, string>) {
  return ''
}

const f = function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

class Relation<T, U extends keyof T> {
  constructor(private classType: Type<T>) {}

  where<V extends T[U], W extends keyof V>(op: Operation<V, W>): string {
    return op.compute()
  }
}

class CanAccess<T, U extends keyof T> {
  constructor(classType: Type<T>, private query: Record<U, string> | undefined = undefined) {

  }

  where<V extends T[U], W extends keyof V>(condition: Record<U, Operation>): string {
    return 'op.compute()'
  }
}

new CanAccess(Comment).where({
  'authorId': Equals('asdf')
})

new CanAccess(Comment).where({
  'authorId': Equals(CurrentUser('id'))
})

new CanAccess(Comment).where({
  'post': Relation(Post).where({
    'authorId': Equals(CurrentUser('id'))
  })
})

abstract class Operation {

  abstract compute(): string

}

// class DBField<T>

class Equals<T, U extends keyof T> extends Operation<T, U> {
  constructor(private classType: Type<T>, private where: Record<U, string>) {
    super()
  }

  compute(): string {
    return Object.keys(this.where).map( (key) => {
      // @ts-ignore
      return this.classType.name + "." + key + " = " + this.where[key];
    }).join(" AND ")

  }
}

const access = new CanAccess(Comment).where(new Equals(User, {
  id: "id",
  email: "stuff"
}))

console.log(access)




@Resolver(() => Post)
export class PostsResolver extends BaseModelResolver(Post, { without: [ Create ] }) {
  @InjectRepository(Post)
  repo: Repository<Post>

  @CreateModelMutation(Post)
  async create(@CreateModelArgs(Post, { type: CreatePostInput }) input: ICreateModelInput<Post>): Promise<IMutationResponse<Post>> {
    const user = FAKE_CURRENT_USER
    if (!user) {
      throw new ForbiddenException()
    }

    const modifiedInput: ICreateModelInput<Post> = {
      ...input,
      authorId: user.id,
    }
    return defaultCreateModelMutation(Post, this.repo, modifiedInput)
  }

  @Query()
  async testPostQuery(): Promise<Array<Post>> {
    const conn = getConnection()

    const postsAlias = 'posts'
    return conn.createQueryBuilder()
      .select(postsAlias)
      .from(Post, postsAlias)
      .where({ authorId: '' })
      .getMany()
  }
}
