import { uploadCover } from '@/lib/cos'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  const url = req.body.url
  const pageId = req.body.page_id
  if (!url) {
    return res.send({ ok: false, error: { message: 'no url' } })
  }
  if (!pageId) {
    return res.send({ ok: false, error: { message: 'no page_id' } })
  }
  try {
    const result = await uploadCover(pageId, url)
    if (!result.ok) {
      return res.send({ ok: false, error: result })
    }
    return res.send({ ok: true, url: result.url || '' })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}
