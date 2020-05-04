import { NestFactory } from '@nestjs/core'
import sourceMapSupport from 'source-map-support'
import { AppModule } from './app.module'
import './core/can/scopes/records/examples'
import { RunExamples } from './core/can/scopes/records/examples'

sourceMapSupport.install()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await RunExamples()
  await app.listen(3000)
}

bootstrap()
