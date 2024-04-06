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
    return res.status(401).send({ error: 'no task_id' })
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
    const results = ret.output.results || []
    if (results[0]?.code) {
      return res.send({ ok: true, task_status, code: results[0].code })
    }

    return res.send({ ok: true, task_status, url: results[0]?.url })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}
