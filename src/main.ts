import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import sourceMapSupport from 'source-map-support'
import { AppModule } from './app.module'

sourceMapSupport.install()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: true,
    allowedHeaders: ["Authorization", "content-type"],
    credentials: true,
  })
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3000)
  await app.listen(port)
}

bootstrap()
