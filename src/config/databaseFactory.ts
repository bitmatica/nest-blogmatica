import { ConfigService } from '@nestjs/config'

export const databaseConfigFactory = async (configService: ConfigService) => ({
  type: 'postgres' as 'postgres',
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USER', 'blogmatica'),
  password: configService.get('DATABASE_PASS', 'blogmatica_password'),
  database: configService.get('DATABASE_DB', 'blogmatica'),
  synchronize: false,
  migrationsRun: false,
  logging: true,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  subscribers: [__dirname + '/../**/*.subscriber.{js,ts}'],
  migrations: [__dirname + '/../database/migrations/*.{js,ts}'],
  cli: {
    entitiesDir: 'src/**/models',
    migrationsDir: 'src/database/migrations',
  },
  extra: {
    connectionLimit: 5,
  },
})
