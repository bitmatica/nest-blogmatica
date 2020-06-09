import { Injectable } from '@nestjs/common'
import { KmsKeyringNode, encrypt, decrypt } from '@aws-crypto/client-node'
import { ConfigService } from '@nestjs/config'
import { IKMSConfig } from '../config/kmsConfig'
import { getOrThrow } from '../core/utils'

@Injectable()
export class EncryptionService {
  private readonly kmsKeyRing: KmsKeyringNode

  constructor(private configService: ConfigService) {
    const config = getOrThrow(configService.get<IKMSConfig>('kms'))
    this.kmsKeyRing = new KmsKeyringNode({ generatorKeyId: config.generateKeyId })
  }

  async encrypt(plaintext: string, encryptionContext: Record<string, string>): Promise<Buffer> {
    // Encryption context provides additional associated data (AAD) to prevent against attacks that change the
    // context of encrypted data (e.g. moving an encrypted SSN from a victim's row to an attacker's row).
    // Encryption context should contain enough non-sensitive data to uniquely identify the location of the encrypted
    // data.  Items in encryption context should not be sensitive as they will be logged.
    // See https://aws.amazon.com/blogs/security/how-to-protect-the-integrity-of-your-encrypted-data-by-using-aws-key-management-service-and-encryptioncontext/
    const { result } = await encrypt(this.kmsKeyRing, plaintext, { encryptionContext })
    return result
  }

  async decrypt(ciphertext: any, encrContext: Record<string, string>): Promise<string> {
    const { plaintext, messageHeader } = await decrypt(this.kmsKeyRing, ciphertext)
    const { encryptionContext } = messageHeader

    Object.entries(encrContext).forEach(([key, value]) => {
      if (encryptionContext[key] !== value)
        throw new Error('Encryption Context does not match expected values')
    })
    return plaintext.toString()
  }
}
