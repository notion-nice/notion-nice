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
    return res.status(401).send({ error: 'no query' })
  }
  try {
    let ret = await fetch(`https://api.coze.cn/open_api/v2/chat`, {
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

    ret = await fetch(
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
    // eslint-disable-next-line no-async-promise-executor
    const url = await new Promise<string>(async (resolve, reason) => {
      let is_task_in_progress = true

      while (is_task_in_progress) {
        const ret = await await fetch(
          `https://dashscope.aliyuncs.com/api/v1/tasks/${task_id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`
            }
          }
        ).then((res) => res.json())
        const task_status = ret.output.task_status
        if (task_status === 'SUCCEEDED') {
          is_task_in_progress = false
          const results = ret.output.results || []
          if (results[0]?.code) {
            return reason(Error(String(results[0].code || 'unknown')))
          }
          resolve(results[0]?.url)
        }
      }
    })

    return res.send({ ok: true, url })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}

export const config = { runtime: 'edge' }
