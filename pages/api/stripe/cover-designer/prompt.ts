import { v4 as uuid } from 'uuid'
import { NextApiRequest, NextApiResponse } from 'next'

if (!process.env.COZE_API_KEY || !process.env.DASHSCOPE_API_KEY) {
  console.log(
    'The .env file is not configured. Follow the instructions in the readme to configure the .env file. '
  )
  process.env.COZE_API_KEY
    ? ''
    : console.log('Add COZE_API_KEY to your .env file.')

  process.env.DASHSCOPE_API_KEY
    ? ''
    : console.log('Add DASHSCOPE_API_KEY to your .env file.')

  process.exit()
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  const query = req.body.query
  if (!query) {
    return res.send({ ok: false, error: { message: 'no query' } })
  }
  try {
    const ret = await fetch(`https://api.coze.cn/open_api/v2/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.COZE_API_KEY}`
      },
      body: JSON.stringify({
        conversation_id: uuid(),
        bot_id: '7354357029684772900',
        user: '29032201862555',
        query,
        stream: false
      })
    }).then((res) => res.json())
    if (ret.code !== 0) {
      console.log(ret)
      return res.send({ ok: false, error: { message: ret.msg } })
    }
    const prompt = ret.messages[0]?.content
    if (!prompt) {
      return res.send({ ok: false, error: { message: 'no prompt' } })
    }

    return res.send({ ok: true, prompt })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}

export const config = { runtime: 'edge' }
