import { createUser } from '@/lib/stripe'
import { NextApiRequest, NextApiResponse } from 'next'

const queue = new Set<string>([])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  const { userId, email, name } = req.body
  try {
    if (queue.has(email)) {
      return res.send({
        ok: false,
        error: { message: 'customer creation in progress' }
      })
    }

    queue.add(email)
    const customer = await createUser({ userId, email, name })
    queue.delete(email)

    return res.send({ ok: true, customer })
  } catch (error) {
    if (queue.has(email)) queue.delete(email)
    return res.send({ ok: false, error: { message: error.message } })
  }
}

export const config = { runtime: 'experimental-edge' }
