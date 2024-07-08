import { isString } from 'lodash-es'
import Stripe from 'stripe'
import dayjs from 'dayjs'
import { sql } from '@vercel/postgres'

if (
  !process.env.STRIPE_SECRET_KEY ||
  !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  !process.env.STRIPE_PRICE_ID
) {
  console.log(
    'The .env file is not configured. Follow the instructions in the readme to configure the .env file. https://github.com/stripe-samples/subscription-use-cases'
  )
  console.log('')
  process.env.STRIPE_SECRET_KEY
    ? ''
    : console.log('Add STRIPE_SECRET_KEY to your .env file.')

  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? ''
    : console.log('Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env file.')

  process.env.STRIPE_PRICE_ID
    ? ''
    : console.log('Add STRIPE_PRICE_ID to your .env file.')
  process.exit()
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const createUser = async ({ userId, email, name }: any) => {
  let customer = await getCustomerByEmail(email, userId, name)
  if (customer?.id) return customer
  customer = await stripe.customers.create({
    name,
    email,
    metadata: { 'notion-user-id': userId }
  })
  console.log('createUser', customer.id)

  return customer
}

export const createCustomer = async ({ userId, email, name }: any) => {
  let customer = await getCustomer(userId)
  if (customer?.id) return customer
  customer = await stripe.customers.create({
    name,
    email,
    metadata: { 'notion-user-id': userId }
  })
  console.log('createCustomer', customer.id)

  const ret =
    await sql`INSERT INTO users (id,name,email,stripe_id,notion_id) VALUES (gen_random_uuid(),${name},${email},${customer.id},${userId});`
  console.log('createCustomer', ret.rows)
  return customer
}

export const getCustomer = async (userId: string) => {
  const ret = await sql`SELECT * FROM users WHERE notion_id=${userId};`
  console.log('getCustomer', ret.rows[0])

  const customerId = ret.rows[0]?.stripe_id
  console.log('getCustomer', customerId)
  if (!customerId) return null

  const customer = await getCustomerById(customerId)

  return updateCustomer(customer)
}

export const getCustomerById = async (userId: string) => {
  const customer = (await stripe.customers.retrieve(userId)) as Stripe.Customer

  return updateCustomer(customer)
}

// 针对通过 userId 获取不到用户的补充，根据邮箱进行获取，并更新对应的用户信息
export const getCustomerByEmail = async (
  email: string,
  userId: string,
  name: string
) => {
  const ret = await stripe.customers.search({
    query: `email:'${email}'`
  })

  let customer = ret.data[0]

  // 如果找到多个用户，则取已付费的用户
  if (ret.data.length > 1) {
    ret.data.forEach((cus) => {
      if (cus.metadata?.plan_type === 'plus') {
        customer = cus
      }
    })
  }

  if (customer?.id) {
    customer = await stripe.customers.update(customer.id, {
      name,
      metadata: { 'notion-user-id': userId }
    })
  }

  return updateCustomer(customer)
}

const updateCustomer = async (customer: Stripe.Customer) => {
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
  if (customer.id) {
    customer = await stripe.customers.update(customer.id, {
      metadata: { plan_type: 'plus', create_at: new Date().toISOString() }
    })
  }

  return customer
}
