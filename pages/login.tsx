import * as React from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function SignIn() {
  return <Button onClick={() => signIn('notion')}>Sign In</Button>
}
