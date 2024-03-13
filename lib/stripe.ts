import { isString } from 'lodash-es'
import Stripe from 'stripe'
import dayjs from 'dayjs'

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
  const ret = await stripe.customers.search({
    query: `metadata['notion-user-id']:'${userId}'`
  })
  console.log('getCustomer', userId, ret.data[0]?.id)

  let customer = ret.data[0]

  if (customer?.id) {
    const isPlus = customer.metadata?.plan_type === 'plus'
    if (isPlus) {
      const createAt = dayjs(customer.metadata?.create_date)
      const now = dayjs()
      const diff = now.diff(createAt, 'year')
      const diffYears = diff
      console.log('diffYears', diffYears)
      if (diffYears >= 1) {
        console.log('stripe customer is expired')
        // 保存用户曾经是 Plus 用户的标识
        customer = await stripe.customers.update(customer.id, {
          metadata: {
            plan_type: 'free',
            create_at: dayjs().toISOString(),
            was_plus: 1
          }
        })
      }
    }
  }

  return customer
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
    metadata: { plan_type: 'plus', create_at: new Date().toISOString() }
  })

  return customer
}