import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const text = url.searchParams.get('text') || 'Game'
    const width = Math.max(100, Math.min(800, parseInt(url.searchParams.get('width') || '400')))
    const height = Math.max(100, Math.min(800, parseInt(url.searchParams.get('height') || '300')))
    const bgColor = url.searchParams.get('bg') || '#1f2937'
    const textColor = url.searchParams.get('color') || '#ffffff'

    // Create proper SVG placeholder
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#DC2626;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#1E3A8A;stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="${bgColor.startsWith('#') ? bgColor : `#${bgColor}`}"/>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="${textColor}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.min(width, height) / 8}" font-weight="bold">${text}</text>
    </svg>`

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    })
  } catch (error) {
    console.error('Placeholder image error:', error)
    
    // Return a simple fallback SVG
    const fallbackSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#DC2626"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="16">IMG</text>
    </svg>`
    
    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Length': Buffer.byteLength(fallbackSvg, 'utf8').toString(),
      },
    })
  }
}