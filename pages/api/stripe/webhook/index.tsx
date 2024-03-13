import { handlePaymentIntent, stripe } from '@/lib/stripe'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const sig = req.headers['stripe-signature']

    let event: Stripe.Event

    try {
      const body = await buffer(req)
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      // On error, log and return the error message
      console.log(`❌ Error message: ${err.message}`)
      res.status(400).send(`Webhook Error: ${err.message}`)
      return
    }

    // Successfully constructed event
    console.log('✅ Success:', event.id)

    // Cast event data to Stripe object
    if (event.type === 'payment_intent.succeeded') {
      handlePaymentIntent(event.data.object)
    } else if (event.type === 'customer.created') {
      // event.data.object.metadata
    } else {
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`)
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}

const buffer = (req: NextApiRequest) => {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    req.on('end', () => {
      resolve(Buffer.concat(chunks))
    })

    req.on('error', reject)
  })
}
