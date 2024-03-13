import { getCustomer, stripe } from '@/lib/stripe'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  try {
    const { userId, email, name } = req.body
    let customer = await getCustomer(userId)
    if (!customer) {
      customer = await stripe.customers.create({
        name,
        email,
        metadata: { 'notion-user-id': userId }
      })
    }

    return res.send({ ok: true, customer })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}