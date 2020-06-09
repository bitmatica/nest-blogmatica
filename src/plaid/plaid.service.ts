import { Injectable } from '@nestjs/common'
import { ModelId } from '../core/model'
import { EncryptionService } from '../encryption/encryption.service'
import { PlaidItem, tableName } from './plaidItem.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import plaid, { Account, Client } from 'plaid'
import { ConfigService } from '@nestjs/config'
import { IPlaidConfig } from '../config/plaidConfig'
import { getOrThrow } from '../core/utils'

@Injectable()
export class PlaidService {
  private readonly client: Client
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
    @InjectRepository(PlaidItem) private readonly plaidSessionRepo: Repository<PlaidItem>,
  ) {
    const config = getOrThrow(this.configService.get<IPlaidConfig>('plaid'))
    this.client = new plaid.Client(
      config.clientId,
      config.secret,
      config.publicKey,
      plaid.environments[config.env],
      config.clientOptions,
    )
  }

  async exchangePublicToken(userId: ModelId, publicToken: string): Promise<string> {
    const response = await this.client.exchangePublicToken(publicToken)
    const item = new PlaidItem()
    item.userId = userId
    item.itemId = response.item_id
    item.accessToken = await this.encryptionService.encrypt(
      response.access_token,
      PlaidService.encryptionContext(userId, response.item_id),
    )
    await this.plaidSessionRepo.save(item)
    return item.itemId
  }

  async getPlaidAccounts(userId: ModelId, itemId: string): Promise<Array<Account>> {
    const accessToken = getOrThrow(await this.getAccessToken(userId, itemId))
    return (await this.client.getAccounts(accessToken)).accounts
  }

  async getAccessToken(userId: ModelId, itemId: string): Promise<string | undefined> {
    // TODO: cache accessToken in-memory to avoid decryption calls?
    const item = await this.plaidSessionRepo.findOne({ userId, itemId })
    return (
      item &&
      (await this.encryptionService.decrypt(
        item.accessToken,
        PlaidService.encryptionContext(userId, itemId),
      ))
    )
  }

  private static encryptionContext(userId: ModelId, itemId: string): Record<string, string> {
    return {
      tableName, // TODO unclear on which attacks are prevented by including tableName here.  Maybe just useful in logs?
      userId,
      itemId,
    }
  }
}
