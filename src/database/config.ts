import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface'

const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'blogmatica',
  password: 'blogmatica_password',
  database: 'blogmatica',
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

// const databaseConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'ec2-54-86-170-8.compute-1.amazonaws.com',
//   port: 5432,
//   username: 'tbvjvgfaxkotep',
//   password: 'ef83fe91fdf6d185a9291939a59cadf68bfb016fc03502cf7eb46f6307dc60e7',
//   database: 'd33rt69nhfd134',
//   synchronize: false,
//   migrationsRun: false,
//   logging: true,
//   entities: [__dirname + '/../**/*.entity.{js,ts}'],
//   subscribers: [__dirname + '/../**/*.subscriber.{js,ts}'],
//   migrations: [__dirname + '/migrations/*.{js,ts}'],
//   cli: {
//     entitiesDir: 'src/**/models',
//     migrationsDir: 'src/database/migrations',
//   },
//   extra: {
//     connectionLimit: 5,
//   },
// }

// This style of export is needed to make config lod correctly for CLI
module.exports = databaseConfig
