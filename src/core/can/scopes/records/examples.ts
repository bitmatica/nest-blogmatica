import { getConnection } from 'typeorm'
import { Comment } from '../../../../comments/comment.entity'
import { Post } from '../../../../posts/post.entity'
import { User } from '../../../../users/user.entity'
import { ComputedValue } from '../../computedValues'
import { RecordScopeCustom } from './index'

// RecordScopeCustom(Post, {
//   createdAt: CurrentUser.get('createdAt'),
// })

// RecordScopeCustom(User, {
//   posts: {
//     $all: [{
//       id: {
//         $eq: '3673061e-3c1a-4f7c-8ecd-ccfff99a528e'
//       }
//     }]
//   }
// })
//
// // Get users where ALL of their posts have id == postId
// export async function scopedAllQuery(postId: string) {
//   const conn = getConnection()
//
//   const results = await conn.createQueryBuilder()
//     .select('users')
//     .from(User, 'users')
//     .where(qb => {
//       const subQuery = qb.subQuery()
//         .select(`(posts.id = :postId) as result`)
//         .from(Post, 'posts')
//         .where("posts.authorId = users.id")
//         .getQuery()
//
//       return "true = ALL(" + subQuery + ")"
//     })
//     .setParameter("postId", postId)
//     .getMany()
//
//   console.log(results)
//   return
// }
//
// // Get users where ANY of their posts have id == postId
// export async function scopedQuery(postId: string) {
//   const conn = getConnection()
//
//   const results = await conn.createQueryBuilder()
//     .select('users')
//     .from(User, 'users')
//     .where(qb => {
//       const subQuery = qb.subQuery()
//         .select(`(posts.id = :postId) as result`)
//         .from(Post, 'posts')
//         .where("posts.authorId = users.id")
//         .getQuery()
//
//       return "true = ANY(" + subQuery + ")"
//     })
//     .setParameter("postId", postId)
//     .getMany()
//
//   console.log(results)
//   return
// }
//
// // Get all Comments who's Post's title contains New
// export async function scopedCommentQuery() {
//   const conn = getConnection()
//   const contains = "%New%"
//
//   const results = await conn.createQueryBuilder()
//     .select('comments')
//     .from(Comment, 'comments')
//     .where(qb => {
//       const subQuery = qb.subQuery()
//         .select(`(posts.title ILIKE :contains) as result`)
//         .from(Post, 'posts')
//         .where("posts.id = comments.postId")
//         .getQuery()
//
//       return "true = " + subQuery
//     })
//     .setParameter("contains", contains)
//     .getMany()
//
//   console.log(results)
//   return
// }
// RecordScopeCustom(Comment, {
//   post: {
//     title: {
//       $contains: 'New'
//     }
//   }
// })

// Get all Comments who's Post's author is current user
export async function scopedCommentsUserIdQuery() {
  const conn = getConnection()
  const currentUserId = '9a2b53ad-4573-48b1-8cab-83fdc57b32fc'

  const results = await conn
    .createQueryBuilder()
    .select('comments')
    .from(Comment, 'comments')
    .where(qb => {
      const subQuery = qb
        .subQuery()
        .select('true')
        .from(Post, 'posts')
        .where('posts.id = comments.postId')
        .andWhere(iqb => {
          return (
            'true = ' +
            iqb
              .subQuery()
              .select('true')
              .from(User, 'posts_author')
              .where('posts_author.id = posts.authorId')
              .andWhere('posts_author.id = :currentUserId', { currentUserId })
              .getQuery()
          )
        })
        .setParameter('currentUserId', currentUserId)
        .getQuery()

      return 'true = ' + subQuery
    })
    .getMany()

  console.log(results)
  return
}

export async function RunExamples() {
  RecordScopeCustom(Comment, {
    authorId: {
      $eq: ComputedValue.UserId,
    },
    id: '1234',
    createdAt: {
      $lt: new Date(),
    },
  })
}

// export async function postsGreaterThan(filter: Date) {
//   const conn = getConnection()
//   const results = await conn.createQueryBuilder()
// }
// RecordScopeCustom(Post, {
//   createdAt: {
//     $gte: CurrentUser.get('createdAt'),
//   },
// })
//
// RecordScopeCustom(User, {
//   posts: {
//     $all: [{
//       id: ''
//     }]
//   }
// })
//
// RecordScopeCustom(Post, {
//   author: {
//     id: CurrentUser.get('id')
//   }
// })
//
// RecordScopeCustom(Post, {
//   $or: [
//     {
//       author: {
//         id: {
//           $eq: CurrentUser.get('id')
//         }
//       }
//     },
//     {
//       createdAt: {
//         $gte: CurrentUser.get('createdAt')
//       }
//     }
//   ]
// })
