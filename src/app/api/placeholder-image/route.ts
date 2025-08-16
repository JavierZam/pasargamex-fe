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
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#DC2626;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#1E3A8A;stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <rect width="100%" height="100%" fill="url(#grad1)" opacity="0.3"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" font-weight="bold">${text}</text>
    </svg>`

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
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
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    })
  }
}