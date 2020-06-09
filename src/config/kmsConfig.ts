export default () => ({
  kms: {
    generateKeyId: process.env.KMS_KEY_ARN,
  },
})

export interface IKMSConfig {
  generateKeyId: string
}
