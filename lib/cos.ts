import COS from 'cos-js-sdk-v5'
import { v4 as uuid } from 'uuid'

if (
  !process.env.COS_SECRETID ||
  !process.env.COS_SECRETKEY ||
  !process.env.COS_REGION ||
  !process.env.COS_BUCKET ||
  !process.env.COS_HOST
) {
  console.log(
    'The .env file is not configured. Follow the instructions in the readme to configure the .env file.'
  )
  console.log('')
  process.env.COS_SECRETID
    ? ''
    : console.log('Add COS_SECRETID to your .env file.')

  process.env.COS_SECRETKEY
    ? ''
    : console.log('Add COS_SECRETKEY to your .env file.')

  process.env.COS_REGION ? '' : console.log('Add COS_REGION to your .env file.')
  process.env.COS_BUCKET ? '' : console.log('Add COS_BUCKET to your .env file.')
  process.env.COS_HOST ? '' : console.log('Add COS_HOST to your .env file.')
  process.exit()
}

const cos = new COS({
  SecretId: process.env.COS_SECRETID,
  SecretKey: process.env.COS_SECRETKEY
})
const Region = process.env.COS_REGION!
// 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
const Bucket = process.env.COS_BUCKET!
// 存储桶Region可以在COS控制台指定存储桶的概览页查看 https://console.cloud.tencent.com/cos5/bucket/
// 关于地域的详情见 https://cloud.tencent.com/document/product/436/6224
const COS_URL = process.env.COS_HOST

export const uploadCover = async (pageId: string, url: string) => {
  try {
    const blockId = uuid()
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to download file')
    }
    const blob = await response.blob()
    const file = new File([blob], blockId)
    const Key = `cover/${pageId}/${blockId}.png`
    await cos.putObject({
      Bucket: Bucket,
      Region: Region,
      Key,
      Body: file
    })
    const newUrl = `${COS_URL}/${Key}`
    return { ok: true, url: newUrl }
  } catch (error) {
    return { ok: false, error }
  }
}
