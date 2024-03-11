import { stripe } from '@/lib/stripe'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  try {
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID)
    return res.send({ ok: true, price })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}
