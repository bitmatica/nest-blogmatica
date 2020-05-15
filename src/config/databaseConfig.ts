import { registerAs } from '@nestjs/config'

export const databaseConfig = {
  type: 'postgres' as 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  username: process.env.DATABASE_USER || 'blogmatica',
  password: process.env.DATABASE_PASS || 'blogmatica_password',
  database: process.env.DATABASE_DB || 'blogmatica',
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
}
export default registerAs('database', () => ({ ...databaseConfig }))
