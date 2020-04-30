import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { CurrentUser, RecordScopeCustom } from './core/can/scopes/records'
import { Post } from './posts/post.entity'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  RecordScopeCustom<Post>({
    author: {
      id: CurrentUser.get('id')
    }
  })
  await app.listen(3000)
}

bootstrap()
