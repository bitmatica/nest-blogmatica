import { Injectable } from '@nestjs/common'
import { ModelId } from '../core/model'
import { EncryptionService } from '../encryption/encryption.service'
import { PlaidItem, tableName } from './plaidItem.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import plaid, { Account, Client } from 'plaid'
import { ConfigService } from '@nestjs/config'
import { IPlaidConfig } from '../config/plaidConfig'

@Injectable()
export class PlaidService {
  private readonly client: Client
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
    @InjectRepository(PlaidItem) private readonly plaidSessionRepo: Repository<PlaidItem>,
  ) {
    const config = this.configService.get<IPlaidConfig>('plaid')
    if (!config) {
      throw new Error('Missing Plaid Config')
    }
    this.client = new plaid.Client(
      config.clientId,
      config.secret,
      config.publicKey,
      plaid.environments[config.env],
      { version: '2019-05-29', clientApp: 'Bitmatica' },
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
    const accessToken = await this.getAccessToken(userId, itemId)
    if (!accessToken) {
      return Promise.reject('Access token invalid')
    }

    return (await this.client.getAccounts(accessToken)).accounts
  }

  async getAccessToken(userId: ModelId, itemId: string): Promise<string | undefined> {
    // TODO: cache accessToken in-memory to avoid decryption calls?
    const item = await this.plaidSessionRepo.findOne({ userId, itemId })
    if (!item) {
      return undefined
    }
    return await this.encryptionService.decrypt(
      item.accessToken,
      PlaidService.encryptionContext(userId, itemId),
    )
  }

  private static encryptionContext(userId: ModelId, itemId: string): Record<string, string> {
    return {
      tableName, // TODO unclear on which attacks are prevented by including tableName here.  Maybe just useful in logs?
      userId,
      itemId,
    }
  }

  private getConfig(key: string): string {
    const value = this.configService.get<string>(key)
    if (!value) throw new Error(`Missing config: ${key}`)
    return value
  }
}
