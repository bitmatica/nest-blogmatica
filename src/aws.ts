import { CostExplorer, IAM } from 'aws-sdk'

const credentials = {
  accessKeyId: 'AKIAUAEU5WULN5DXOTEG',
  secretAccessKey: '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',
}

export async function awsTest() {
  const client = new IAM({ credentials })

  const users = await client.listUsers().promise()
  console.log(1, users.$response.data)

  const policies = await client
    .listAttachedUserPolicies({
      UserName: 'setup-user',
    })
    .promise()

  console.log(15, policies.$response.data)

  const user = await client.getUser().promise()
  console.log(user)
  // const response = await client
  //   .attachUserPolicy({
  //     UserName: 'setup-user',
  //     PolicyArn: 'arn:aws:iam::aws:policy/AmazonS3FullAccess',
  //   })
  //   .promise()
  //
  // console.log(2, response.$response.data)

  const ce = new CostExplorer({ credentials, region: 'us-east-1' })

  const buckets = await ce
    .getCostAndUsage({
      Granularity: 'DAILY',
      Metrics: ['BlendedCost', 'UnblendedCost', 'UsageQuantity'],
      TimePeriod: {
        Start: '2020-04-01',
        End: '2020-05-01',
      },
    })
    .promise()
  console.log(buckets)
}
