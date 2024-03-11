import { stripe } from '@/lib/stripe'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  try {
    const { userId, email, name } = req.body
    let customerId = ''
    const customers = await stripe.customers.search({
      query: `metadata['notion-user-id']:'${userId}'`
    })
    if (customers.data?.length) {
      customerId = customers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        name,
        email,
        metadata: { 'notion-user-id': userId }
      })
      customerId = customer.id
    }

    return res.send({ customerId })
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } })
  }
}
