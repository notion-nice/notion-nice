import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  const { error } = req.body
  try {
    const content = `<font color="warning">NotionNice 异常通知</font>
<font color="info">Name:</font> ${error.name} {request_url}
<font color="info">Message:</font> ${error.message}

\`\`\`
${error.stack}
\`\`\`
`
    const params = {
      msgtype: 'markdown',
      markdown: { content }
    }
    const resp = await fetch(
      `${process.env.WECOM_BOT_WEBHOOK_URL}?key=${process.env.WECOM_BOT_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      }
    )
    const data = await resp.json()

    return res.send({ ok: true, data })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}

export const config = { runtime: 'experimental-edge' }
