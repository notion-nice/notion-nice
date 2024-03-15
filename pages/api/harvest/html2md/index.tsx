import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  res.send({ ok: true })
}
