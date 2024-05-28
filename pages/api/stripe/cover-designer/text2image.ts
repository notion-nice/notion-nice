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
  const prompt = req.body.prompt
  if (!prompt) {
    return res.send({ ok: false, error: { message: 'no prompt' } })
  }
  try {
    const ret = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis`,
      {
        method: 'POST',
        headers: {
          'X-DashScope-Async': 'enable',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`
        },
        body: JSON.stringify({
          model: 'wanx-v1',
          input: { prompt },
          parameters: {
            style: '<sketch>',
            size: '1280*720',
            n: 1,
            seed: 42
          }
        })
      }
    ).then((res) => res.json())
    const task_id = ret.output.task_id
    if (!task_id) {
      return res.send({ ok: false, error: { message: 'no task_id' } })
    }

    return res.send({ ok: true, task_id })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}

export const config = { runtime: 'experimental-edge' }
