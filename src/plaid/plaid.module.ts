import { Module } from '@nestjs/common'
import { PlaidService } from './plaid.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PlaidItem } from './plaidItem.entity'
import { PlaidResolver } from './plaid.resolver'
import { EncryptionService } from '../encryption/encryption.service'

@Module({
  imports: [TypeOrmModule.forFeature([PlaidItem])],
  providers: [PlaidService, PlaidResolver, EncryptionService],
})
export class PlaidModule {}
