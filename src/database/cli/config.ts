import databaseConfig from '../../config/databaseConfig'
import dotenv from 'dotenv'

// This is intended to be used by the typeorm CLI
dotenv.config()
module.exports = databaseConfig()
