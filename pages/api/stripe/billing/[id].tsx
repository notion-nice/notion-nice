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
      return res.send({ ok: false, error: { message: '参数异常' } })
    }
    const customerId = (await getCustomer(userId))?.id
    if (!customerId) {
      return res.send({ ok: false, error: { message: '用户不存在' } })
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: DOMAIN
    })

    return res.send({ ok: true, url: session.url })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}
