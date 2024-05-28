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
  const task_id = req.body.task_id
  if (!task_id) {
    return res.send({ ok: false, error: { message: 'no task_id' } })
  }
  try {
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
    if (task_status === 'FAILED') {
      return res.send({
        ok: false,
        task_status,
        error: { ...ret.output }
      })
    }
    if (task_status === 'SUCCEEDED') {
      const results = ret.output.results || []
      if (results[0]?.code) {
        return res.send({ ok: false, task_status, code: results[0].code })
      }
      const url = results[0]?.url || ''
      return res.send({ ok: true, task_status, url })
    }
    return res.send({ ok: true, task_status })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}

export const config = { runtime: 'experimental-edge' }
