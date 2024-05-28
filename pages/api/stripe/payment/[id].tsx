import { stripe, getCustomerById } from '@/lib/stripe'
import { NextApiRequest, NextApiResponse } from 'next'

const DOMAIN = 'https://www.notion.so/'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const userId = req.query.id
  if (req.method === 'GET') {
    try {
      if (typeof userId !== 'string') {
        return res.send({ ok: false, error: { message: '参数异常', userId } })
      }
      const paymentIntents = await stripe.paymentIntents.list({
        customer: userId,
        limit: 20
      })
      return res.send({ ok: true, list: paymentIntents })
    } catch (error) {
      return res.send({ ok: false, error: { message: error.message } })
    }
  }
  if (req.method === 'POST') {
    try {
      if (typeof userId !== 'string') {
        return res.send({ ok: false, error: { message: '参数异常', userId } })
      }
      if (!userId.startsWith('cus_')) {
        return res.send({ ok: false, error: { message: '参数异常', userId } })
      }
      const customer = await getCustomerById(userId)
      if (!customer?.id) {
        return res.send({ ok: false, error: { message: '用户不存在', userId } })
      }
      const isPlus = customer.metadata?.plan_type === 'plus'
      if (isPlus) {
        return res.send({
          ok: false,
          customer,
          error: { message: '用户已经是 Plus 会员了' }
        })
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
        allow_promotion_codes: true,
        payment_method_types: ['alipay', 'card'],
        success_url: `${DOMAIN}?payment_attempt_state=succeeded`,
        cancel_url: `${DOMAIN}?payment_attempt_state=canceled`
      })

      console.log('session', userId, session)

      return res.send({ ok: true, url: session.url })
    } catch (error) {
      return res.send({ ok: false, error: { message: error.message } })
    }
  }
  return res.status(405).send({ error: 'method not allowed' })
}

export const config = { runtime: 'experimental-edge' }
