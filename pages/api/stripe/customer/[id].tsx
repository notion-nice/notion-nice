import { getCustomer, stripe } from '@/lib/stripe'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const userId = req.query.id
      if (typeof userId !== 'string') {
        return res.status(404).send({ error: { message: '用户不存在' } })
      }
      const customer = await getCustomer(userId)

      if (customer) {
        return res.send({ customer })
      }

      return res.status(404).send({ error: { message: '用户不存在' } })
    } catch (error) {
      return res.status(400).send({ error: { message: error.message } })
    }
  }
  if (req.method === 'POST') {
    try {
      const userId = req.query.id
      if (typeof userId !== 'string') {
        return res.status(404).send({ error: { message: '用户不存在' } })
      }
      const customerId = (await getCustomer(userId))?.id
      if (!customerId) {
        return res.status(404).send({ error: { message: '用户不存在' } })
      }
      const customer = await stripe.customers.update(customerId, req.body)

      if (customer) {
        return res.send({ customer })
      }

      return res.status(404).send({ error: { message: '用户不存在' } })
    } catch (error) {
      return res.status(400).send({ error: { message: error.message } })
    }
  }
  return res.status(405).send({ error: 'method not allowed' })
}
