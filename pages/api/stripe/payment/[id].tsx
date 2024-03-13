import { stripe, getCustomer } from '@/lib/stripe'
import { NextApiRequest, NextApiResponse } from 'next'

const DOMAIN = 'https://www.notion.so/'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  try {
    const userId = req.query.id
    if (typeof userId !== 'string') {
      return res.send({ ok: false, error: { message: '用户不存在' } })
    }
    const customer = await getCustomer(userId)
    if (!customer.id) {
      return res.send({ ok: false, error: { message: '用户不存在' } })
    }
    const isPlus = customer.metadata?.plan_type === 'plus'
    if (isPlus) {
      return res.send({ ok: false, customer, error: { message: '用户已经是 Plus 会员了' } })
    }
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      metadata: {
        type: 'upgrade_plus_year'
      },
      mode: 'payment',
      customer: customer.id,
      success_url: `${DOMAIN}?payment_attempt_state=succeeded`,
      cancel_url: `${DOMAIN}?payment_attempt_state=canceled`
    })

    return res.send({ ok: true, url: session.url })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}
