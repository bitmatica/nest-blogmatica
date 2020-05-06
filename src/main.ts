import { NestFactory } from '@nestjs/core'
import sourceMapSupport from 'source-map-support'
import { AppModule } from './app.module'
import { awsTest } from './aws'

sourceMapSupport.install()

async function bootstrap() {
  await awsTest()
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}

bootstrap()
