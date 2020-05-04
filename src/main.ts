import { NestFactory } from '@nestjs/core'
import sourceMapSupport from 'source-map-support'
import { AppModule } from './app.module'
import './core/can/scopes/records/examples'
import { scopedCommentsUserIdQuery } from './core/can/scopes/records/examples'

sourceMapSupport.install()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await scopedCommentsUserIdQuery()
  await app.listen(3000)
}

bootstrap()
