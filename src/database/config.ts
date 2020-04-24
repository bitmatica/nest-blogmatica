import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

const databaseConfig: TypeOrmModuleOptions = {
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "blogmatica",
  "password": "blogmatica_password",
  "database": "blogmatica",
  "synchronize": false,
  "migrationsRun":  false,
  "logging": false,
  "entities": [
    __dirname + '/../**/*.entity.{js,ts}'
  ],
  "subscribers": [
    __dirname + '/../**/*.subscriber.{js,ts}'
  ],
  "migrations": [
    __dirname + '/migrations/*.{js,ts}'
  ],
  "cli": {
    "entitiesDir": "src/**/models",
    "migrationsDir": "src/database/migrations"
  },
  "extra": {
    "connectionLimit": 5
  }
}

// This style of export is needed to make config lod correctly for CLI
module.exports = databaseConfig
