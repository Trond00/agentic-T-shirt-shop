import { redirect } from 'next/navigation'

import { stripe } from '../../lib/stripe'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Return({ searchParams }: PageProps) {
  const { session_id } = await searchParams

  if (!session_id || typeof session_id !== 'string')
    throw new Error('Please provide a valid session_id (`cs_test_...`)')

  const {
    status,
    customer_details
  } = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  })

  const customerEmail = customer_details?.email

  if (status === 'open') {
    return redirect('/')
  }

  if (status === 'complete') {
    return (
      <section id="success">
        <p>
          We appreciate your business! A confirmation email will be sent to{' '}
          {customerEmail}. If you have any questions, please email{' '}
        </p>
        <a href="mailto:orders@example.com">orders@example.com</a>.
      </section>
    )
  }
}
