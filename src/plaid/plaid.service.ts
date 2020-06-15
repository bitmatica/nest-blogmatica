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
import { Lazy } from '../core/utils/Lazy'

@Injectable()
export class PlaidService {
  private readonly client: Lazy<Client>
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
    @InjectRepository(PlaidItem) private readonly plaidSessionRepo: Repository<PlaidItem>,
  ) {

    const config = getOrThrow(this.configService.get<IPlaidConfig>('plaid'))
    this.client = new Lazy<Client>(() => new plaid.Client(
      config.clientId,
      config.secret,
      config.publicKey,
      plaid.environments[config.env],
      { version: '2019-05-29', clientApp: 'Bitmatica' },
    ))
  }

  async exchangePublicToken(userId: ModelId, publicToken: string): Promise<string> {
    const response = await this.client.value.exchangePublicToken(publicToken)
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
    const accounts = await this.client.value.getAccounts(accessToken)
    return accounts.accounts
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
