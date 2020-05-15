import { registerAs } from '@nestjs/config'
import dotenv from 'dotenv'

dotenv.config()

export default registerAs('database', () => ({
  type: 'postgres' as 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_DB,
  synchronize: false,
  migrationsRun: false,
  logging: true,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  subscribers: [__dirname + '/../**/*.subscriber.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  cli: {
    entitiesDir: 'src/**/models',
    migrationsDir: 'src/database/migrations',
  },
  extra: {
    connectionLimit: 5,
  },
}))
