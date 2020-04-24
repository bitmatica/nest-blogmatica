import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { run } from './authorization';

async function bootstrap() {
  await run()
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
