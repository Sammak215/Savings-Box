import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter: 5 requests per IP per 60s
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please wait a minute.' },
      { status: 429 }
    )
  }

  let licenseKey: string
  try {
    const body = await req.json()
    licenseKey = body.licenseKey
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 }
    )
  }

  if (!licenseKey || typeof licenseKey !== 'string') {
    return NextResponse.json(
      { success: false, error: 'License key is required.' },
      { status: 400 }
    )
  }

  const permalink = process.env.GUMROAD_PRODUCT_PERMALINK
  if (!permalink) {
    return NextResponse.json(
      { success: false, error: 'Server configuration error.' },
      { status: 500 }
    )
  }

  try {
    const gumroadRes = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_permalink: permalink,
        license_key: licenseKey.trim(),
      }),
    })

    const data = await gumroadRes.json()

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid or already-used license key.' },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      uses: data.uses,
      purchase: {
        email: data.purchase?.email,
        created_at: data.purchase?.created_at,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Network error. Please try again.' },
      { status: 503 }
    )
  }
}
