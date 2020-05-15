import dotenv from 'dotenv'
import { config } from '../config/databaseConfig'

dotenv.config()

// This is intended to be used by the typeorm CLI
module.exports = config
