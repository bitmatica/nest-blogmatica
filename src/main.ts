import { NestFactory } from '@nestjs/core'
import sourceMapSupport from 'source-map-support'
import { AppModule } from './app.module'

sourceMapSupport.install()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  await app.listen(process.env.PORT || 3001)
}

bootstrap()
