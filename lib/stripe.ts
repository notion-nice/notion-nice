import { isString } from 'lodash-es'
import Stripe from 'stripe'

if (
  !process.env.STRIPE_SECRET_KEY ||
  !process.env.STRIPE_PUBLISHABLE_KEY ||
  !process.env.STRIPE_PRICE_ID
) {
  console.log(
    'The .env file is not configured. Follow the instructions in the readme to configure the .env file. https://github.com/stripe-samples/subscription-use-cases'
  )
  console.log('')
  process.env.STRIPE_SECRET_KEY
    ? ''
    : console.log('Add STRIPE_SECRET_KEY to your .env file.')

  process.env.STRIPE_PUBLISHABLE_KEY
    ? ''
    : console.log('Add STRIPE_PUBLISHABLE_KEY to your .env file.')

  process.env.STRIPE_PRICE_ID
    ? ''
    : console.log('Add STRIPE_PRICE_ID to your .env file.')
  process.exit()
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const getCustomer = async (userId: string) => {
  const customer = await stripe.customers.search({
    query: `metadata['notion-user-id']:'${userId}'`
  })
  console.log('getCustomer', userId, customer.data[0]?.id)

  return customer.data[0]
}

export const handlePaymentIntent = async (
  stripeObject: Stripe.PaymentIntent
) => {
  console.log('handlePaymentIntent', JSON.stringify(stripeObject, null, 2))
  let customer: Stripe.Customer
  if (isString(stripeObject.customer)) {
    customer = (await stripe.customers.retrieve(stripeObject.customer)) as any
  } else {
    customer = stripeObject.customer as Stripe.Customer
  }
  customer = await stripe.customers.update(customer.id, {
    metadata: { plan_type: 'plus' }
  })

  return customer
}
