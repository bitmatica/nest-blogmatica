import { ConfigService } from '@nestjs/config'

export const databaseConfigFactory = async (configService: ConfigService) => ({
  type: 'postgres' as 'postgres',
  host: configService.get('database.host'),
  port: configService.get<number>('database.port'),
  username: configService.get('database.username'),
  password: configService.get('database.password'),
  database: configService.get('database.database'),
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
})
