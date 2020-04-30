import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import './core/can/scopes/records/examples'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}

bootstrap()
