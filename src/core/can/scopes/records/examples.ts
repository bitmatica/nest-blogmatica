import { Post } from '../../../../posts/post.entity'
import { User } from '../../../../users/user.entity'
import { CurrentUser, RecordScopeCustom } from './index'

// RecordScopeCustom<Post>({
//   createdAt: CurrentUser.get('createdAt'),
// })

RecordScopeCustom<User>({
  posts: {
    $all: [{
      id: {
        $eq: ''
      }
    }]
  }
})

// RecordScopeCustom<Post>({
//   createdAt: {
//     $gte: CurrentUser.get('createdAt'),
//   },
// })
//
// RecordScopeCustom<User>({
//   posts: {
//     $all: [{
//       id: ''
//     }]
//   }
// })
//
// RecordScopeCustom<Post>({
//   author: {
//     id: CurrentUser.get('id')
//   }
// })
//
// RecordScopeCustom<Post>({
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
