#!/usr/bin/env node

// Test production API endpoints
const API_BASE_URL = 'https://pasargamex-api-244929333106.asia-southeast2.run.app'

async function testApiEndpoints() {
  console.log('🧪 Testing Production API endpoints...')
  console.log(`🌐 API URL: ${API_BASE_URL}`)
  console.log('')

  const endpoints = [
    { 
      name: 'Health Check', 
      path: '/v1/health', 
      method: 'GET',
      requiresAuth: false 
    },
    { 
      name: 'Game Titles (Public)', 
      path: '/v1/game-titles?limit=10', 
      method: 'GET',
      requiresAuth: false 
    },
    { 
      name: 'Game Titles (Active Only)', 
      path: '/v1/game-titles?status=active&limit=6', 
      method: 'GET',
      requiresAuth: false 
    },
    { 
      name: 'Products (Public)', 
      path: '/v1/products?limit=5', 
      method: 'GET',
      requiresAuth: false 
    }
  ]

  const authToken = process.env.ADMIN_TOKEN

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint.name}`)
      console.log(`   📡 ${endpoint.method} ${endpoint.path}`)
      
      const headers = {
        'Content-Type': 'application/json'
      }

      if (endpoint.requiresAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`   ✅ Status: ${response.status} OK`)
        
        if (endpoint.name.includes('Game Titles')) {
          if (data.data && Array.isArray(data.data)) {
            console.log(`   📊 Found: ${data.data.length} game titles`)
            if (data.data.length > 0) {
              console.log(`   🎮 Sample games:`)
              data.data.slice(0, 3).forEach(game => {
                console.log(`      - ${game.name} (${game.slug}) - ${game.status}`)
              })
            } else {
              console.log(`   📝 No game titles found - database might be empty`)
            }
          }
        } else if (endpoint.name.includes('Products')) {
          if (data.data && Array.isArray(data.data)) {
            console.log(`   📊 Found: ${data.data.length} products`)
          }
        } else if (endpoint.name.includes('Health')) {
          console.log(`   💚 Server is healthy`)
          if (data.message) {
            console.log(`   💬 Message: ${data.message}`)
          }
        }
      } else {
        console.log(`   ❌ Status: ${response.status}`)
        console.log(`   💬 Error: ${data.error?.message || data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`)
      
      if (error.message.includes('fetch failed')) {
        console.log(`   🌐 Possible network issue or server down`)
      }
    }
    
    console.log('')
  }

  // Test game title creation if admin token provided
  if (authToken) {
    console.log('🔑 Admin token detected - testing admin endpoints...')
    
    try {
      console.log(`🔍 Testing: Admin Game Title Creation (Test)`)
      const testGame = {
        name: 'Test Game (Will Delete)',
        description: 'Test game for API verification',
        icon: 'https://example.com/test-icon.jpg',
        banner: 'https://example.com/test-banner.jpg',
        attributes: [
          {
            name: 'Level',
            type: 'number',
            required: true,
            description: 'Player level'
          }
        ],
        status: 'active'
      }

      const response = await fetch(`${API_BASE_URL}/v1/admin/game-titles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testGame)
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`   ✅ Admin API works! Created test game with ID: ${data.data?.id}`)
        console.log(`   🗑️  Remember to delete the test game manually`)
      } else {
        console.log(`   ❌ Admin API error: ${response.status}`)
        console.log(`   💬 Error: ${data.error?.message || data.message}`)
        
        if (response.status === 401) {
          console.log(`   🔐 Token might be invalid or expired`)
        }
      }
    } catch (error) {
      console.log(`   ❌ Admin API test failed: ${error.message}`)
    }
  } else {
    console.log('ℹ️  No admin token provided - skipping admin endpoint tests')
    console.log('   💡 Use: ADMIN_TOKEN=your_token node test-production-api.js')
  }

  console.log('')
  console.log('🏁 API testing complete!')
  
  if (!authToken) {
    console.log('')
    console.log('🚀 Ready to seed games? Run:')
    console.log('   ADMIN_TOKEN=your_admin_token node scripts/seed-production-games.js')
  }
}

// Run the test
testApiEndpoints().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})