import { getCustomer, stripe } from '@/lib/stripe'
import { NextApiRequest, NextApiResponse } from 'next'

const queue = new Set<string>([])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  const { userId, email, name } = req.body
  try {
    let customer = await getCustomer(userId)
    if (!customer) {
      if (queue.has(userId)) {
        return res.send({
          ok: false,
          error: { message: 'customer creation in progress' }
        })
      }
      queue.add(userId)
      customer = await stripe.customers.create({
        name,
        email,
        metadata: { 'notion-user-id': userId }
      })
      queue.delete(userId)
    }

    return res.send({ ok: true, customer })
  } catch (error) {
    if (queue.has(userId)) queue.delete(userId)
    return res.send({ ok: false, error: { message: error.message } })
  }
}
