import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { PostsService } from '../posts/posts.service'
import { UsersService } from '../users/users.service'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const usersService = app.get(UsersService)

  console.log(usersService.getByEmail('carl@bitmatica.com'))
  await app.close()
}
bootstrap()
