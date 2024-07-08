import React, { useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { stripe } from '@/lib/stripe'

interface PageProps {
  client_secret?: string
  wechat_pay_display_qr_code?: string
  errMsg?: string
}

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method_types: ['wechat_pay'],

      amount: 2900,
      currency: 'hkd'
    })
    console.log(
      'next_action',
      JSON.stringify(paymentIntent.next_action, null, 2)
    )

    return {
      props: { client_secret: paymentIntent.client_secret }
    }
  } catch (error) {
    return {
      props: { client_secret: '', errMsg: error.message }
    }
  }
}

async function confirmWechatPayPayment(client_secret: string) {
  const stripe = await loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  )
  const { error, paymentIntent } = await stripe.confirmWechatPayPayment(
    client_secret,
    {
      payment_method_options: {
        wechat_pay: {
          client: 'web'
        }
      }
    }
  )
  if (error) {
    console.error(error)
    throw new Error(error.message)
  }

  console.log('paymentIntent', paymentIntent)

  return
}

const WeChatPay: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ client_secret, errMsg }) => {
  useEffect(() => {
    confirmWechatPayPayment(client_secret)
  }, [])
  return (
    <div>
      <h1>WeChat Pay Page</h1>
      <p>{client_secret}</p>
      {errMsg && <p>{errMsg}</p>}
    </div>
  )
}

export default WeChatPay
