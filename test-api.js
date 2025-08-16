#!/usr/bin/env node

// Simple test to verify API endpoints are working
const API_BASE_URL = process.env.API_URL || 'http://localhost:8080'

async function testApiEndpoints() {
  console.log('🧪 Testing API endpoints...')
  console.log(`📡 API Base URL: ${API_BASE_URL}`)

  const endpoints = [
    { name: 'Health Check', path: '/v1/health', method: 'GET' },
    { name: 'Game Titles', path: '/v1/game-titles?limit=6', method: 'GET' },
    { name: 'Game Titles with Status', path: '/v1/game-titles?status=active&limit=6', method: 'GET' }
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint.name} (${endpoint.method} ${endpoint.path})`)
      
      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: OK (${response.status})`)
        if (endpoint.name.includes('Game Titles')) {
          console.log(`   📊 Data type: ${typeof data.data}`)
          if (Array.isArray(data.data)) {
            console.log(`   📝 Records found: ${data.data.length}`)
            if (data.data.length > 0) {
              const sample = data.data[0]
              console.log(`   🎮 Sample game: ${sample.name || 'No name'}`)
            }
          }
        }
      } else {
        console.log(`❌ ${endpoint.name}: Error ${response.status}`)
        console.log(`   📝 Message: ${data.error?.message || data.message || 'No message'}`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Connection failed`)
      console.log(`   📝 Error: ${error.message}`)
    }
  }

  console.log('\n🏁 API testing complete!')
}

// Run the test
testApiEndpoints().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})