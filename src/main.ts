import { NestFactory } from '@nestjs/core'
import sourceMapSupport from 'source-map-support'
import { AppModule } from './app.module'

sourceMapSupport.install()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}

bootstrap()
