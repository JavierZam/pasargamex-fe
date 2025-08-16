import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { size: string } }
) {
  const size = parseInt(params.size) || 192
  
  // Create PasargameX logo SVG icon
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#DC2626;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background circle -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2-4}" fill="url(#grad1)"/>
      
      <!-- Gaming controller icon -->
      <g transform="translate(${size*0.25}, ${size*0.3}) scale(${size/400})">
        <path d="M150 80C110 80 80 110 80 150V200C80 240 110 270 150 270H250C290 270 320 240 320 200V150C320 110 290 80 250 80H150Z" fill="white" fill-opacity="0.9"/>
        
        <!-- D-Pad -->
        <rect x="120" y="140" width="15" height="40" rx="3" fill="#1F2937"/>
        <rect x="112.5" y="147.5" width="30" height="15" rx="3" fill="#1F2937"/>
        
        <!-- Action buttons -->
        <circle cx="270" cy="145" r="8" fill="#DC2626"/>
        <circle cx="290" cy="125" r="8" fill="#059669"/>
        <circle cx="290" cy="165" r="8" fill="#1D4ED8"/>
        <circle cx="310" cy="145" r="8" fill="#FBBF24"/>
        
        <!-- Analog sticks -->
        <circle cx="160" cy="200" r="12" fill="#374151"/>
        <circle cx="240" cy="200" r="12" fill="#374151"/>
      </g>
      
      <!-- Text -->
      <text x="${size/2}" y="${size*0.85}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${size/12}">PGX</text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}