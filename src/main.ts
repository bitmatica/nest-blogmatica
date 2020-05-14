import { NestFactory } from '@nestjs/core'
import sourceMapSupport from 'source-map-support'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'

sourceMapSupport.install()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3000)
  await app.listen(port)
}

bootstrap()
