import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'Email service is not configured.' }, { status: 503 })
    }

    const resend = new Resend(apiKey)
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!name || !email || !message) {
      return Response.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send(
      {
        from: 'onboarding@resend.dev',
        to: ['workforraj15@gmail.com'],
        replyTo: email,
        subject: `Portfolio contact from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      },
      { idempotencyKey: `portfolio-contact/${crypto.randomUUID()}` },
    )

    if (error) {
      return Response.json({ error: error.message || 'Unable to send your message.' }, { status: 502 })
    }

    return Response.json({ success: true, id: data?.id })
  } catch {
    return Response.json({ error: 'Unable to process your message.' }, { status: 400 })
  }
}
