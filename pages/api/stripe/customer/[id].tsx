import { getCustomer, stripe } from '@/lib/stripe'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const userId = req.query.id
      if (typeof userId !== 'string') {
        return res.send({ ok: false, error: { message: '用户不存在' } })
      }
      const customer = await getCustomer(userId)

      if (customer) {
        return res.send({ ok: true, customer })
      }

      return res.send({ ok: false, error: { message: '用户不存在' } })
    } catch (error) {
      return res.send({ ok: false, error: { message: error.message } })
    }
  }
  if (req.method === 'POST') {
    try {
      const userId = req.query.id
      if (typeof userId !== 'string') {
        return res.send({ ok: false, error: { message: '用户不存在' } })
      }
      const customerId = (await getCustomer(userId))?.id
      if (!customerId) {
        return res.send({ ok: false, error: { message: '用户不存在' } })
      }
      const customer = await stripe.customers.update(customerId, req.body)

      if (customer) {
        return res.send({ ok: true, customer })
      }

      return res.send({ ok: false, error: { message: '用户不存在' } })
    } catch (error) {
      return res.send({ ok: false, error: { message: error.message } })
    }
  }
  return res.status(405).send({ error: 'method not allowed' })
}
