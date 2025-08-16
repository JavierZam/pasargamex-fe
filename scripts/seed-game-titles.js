#!/usr/bin/env node

const API_BASE_URL = process.env.API_URL || 'http://localhost:8080'

const gameData = [
  {
    name: 'Genshin Impact',
    description: 'Open-world action RPG developed by miHoYo. Explore the magical world of Teyvat.',
    icon: '/api/placeholder-image?text=GI&width=200&height=200&bg=%23E6B800',
    banner: '/api/placeholder-image?text=Genshin&width=800&height=400&bg=%235A3E8A',
    status: 'active',
    attributes: [
      {
        name: 'Adventure Rank',
        type: 'number',
        required: true,
        description: 'Current Adventure Rank of the account'
      },
      {
        name: 'Server',
        type: 'select',
        required: true,
        options: ['America', 'Europe', 'Asia', 'TW/HK/MO'],
        description: 'Server region'
      },
      {
        name: '5-Star Characters',
        type: 'string',
        required: false,
        description: 'List of owned 5-star characters'
      }
    ]
  },
  {
    name: 'Honkai: Star Rail',
    description: 'Turn-based RPG from miHoYo featuring space fantasy adventure.',
    icon: '/api/placeholder-image?text=HSR&width=200&height=200&bg=%23EC4899',
    banner: '/api/placeholder-image?text=HSR&width=800&height=400&bg=%23BE185D',
    status: 'active',
    attributes: [
      {
        name: 'Trailblaze Level',
        type: 'number',
        required: true,
        description: 'Current Trailblaze Level'
      },
      {
        name: 'Server',
        type: 'select',
        required: true,
        options: ['America', 'Europe', 'Asia', 'TW/HK/MO'],
        description: 'Server region'
      },
      {
        name: '5-Star Characters',
        type: 'string',
        required: false,
        description: 'List of owned 5-star characters'
      }
    ]
  },
  {
    name: 'Valorant',
    description: 'Tactical 5v5 character-based tactical FPS by Riot Games.',
    icon: '/api/placeholder-image?text=VAL&width=200&height=200&bg=%23EF4444',
    banner: '/api/placeholder-image?text=Valorant&width=800&height=400&bg=%23DC2626',
    status: 'active',
    attributes: [
      {
        name: 'Current Rank',
        type: 'select',
        required: true,
        options: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'],
        description: 'Current competitive rank'
      },
      {
        name: 'Region',
        type: 'select',
        required: true,
        options: ['NA', 'EU', 'AP', 'KR', 'BR', 'LATAM'],
        description: 'Account region'
      },
      {
        name: 'Agents Unlocked',
        type: 'string',
        required: false,
        description: 'List of unlocked agents'
      }
    ]
  },
  {
    name: 'Mobile Legends: Bang Bang',
    description: 'Popular 5v5 MOBA game designed for mobile devices.',
    icon: '/api/placeholder-image?text=ML&width=200&height=200&bg=%233B82F6',
    banner: '/api/placeholder-image?text=ML&width=800&height=400&bg=%231D4ED8',
    status: 'active',
    attributes: [
      {
        name: 'Current Rank',
        type: 'select',
        required: true,
        options: ['Warrior', 'Elite', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic', 'Mythical Glory'],
        description: 'Current rank'
      },
      {
        name: 'Server',
        type: 'string',
        required: true,
        description: 'Server ID'
      },
      {
        name: 'Heroes Owned',
        type: 'number',
        required: false,
        description: 'Number of heroes owned'
      }
    ]
  },
  {
    name: 'Free Fire',
    description: 'Battle royale game on mobile platforms developed by 111dots Studio.',
    icon: '/api/placeholder-image?text=FF&width=200&height=200&bg=%2322C55E',
    banner: '/api/placeholder-image?text=Free%20Fire&width=800&height=400&bg=%2316A34A',
    status: 'active',
    attributes: [
      {
        name: 'Current Rank',
        type: 'select',
        required: true,
        options: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Grand Master'],
        description: 'Current BR rank'
      },
      {
        name: 'Level',
        type: 'number',
        required: true,
        description: 'Account level'
      },
      {
        name: 'Characters Owned',
        type: 'string',
        required: false,
        description: 'List of owned characters'
      }
    ]
  },
  {
    name: 'PUBG Mobile',
    description: 'Battle royale game adapted from PlayerUnknown\'s Battlegrounds for mobile.',
    icon: '/api/placeholder-image?text=PUBG&width=200&height=200&bg=%23F97316',
    banner: '/api/placeholder-image?text=PUBG&width=800&height=400&bg=%23EA580C',
    status: 'active',
    attributes: [
      {
        name: 'Current Tier',
        type: 'select',
        required: true,
        options: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'],
        description: 'Current rank tier'
      },
      {
        name: 'Server',
        type: 'select',
        required: true,
        options: ['Global', 'Korea', 'Vietnam', 'Nordic Map'],
        description: 'Server region'
      },
      {
        name: 'RP Points',
        type: 'number',
        required: false,
        description: 'Current season RP points'
      }
    ]
  }
]

async function createGameTitle(gameTitle, authToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/game-titles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(gameTitle)
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log(`✅ Created game title: ${gameTitle.name}`)
      return result
    } else {
      console.log(`❌ Failed to create ${gameTitle.name}:`, result.error?.message || result.message)
      return null
    }
  } catch (error) {
    console.log(`❌ Error creating ${gameTitle.name}:`, error.message)
    return null
  }
}

async function seedGameTitles() {
  const authToken = process.env.ADMIN_TOKEN
  
  if (!authToken) {
    console.log('❌ ADMIN_TOKEN environment variable is required')
    console.log('Usage: ADMIN_TOKEN=your_token node scripts/seed-game-titles.js')
    process.exit(1)
  }

  console.log('🌱 Starting to seed game titles...')
  console.log(`📡 API Base URL: ${API_BASE_URL}`)
  
  let successCount = 0
  let failCount = 0

  for (const gameTitle of gameData) {
    const result = await createGameTitle(gameTitle, authToken)
    if (result) {
      successCount++
    } else {
      failCount++
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n📊 Seeding complete!')
  console.log(`✅ Successfully created: ${successCount} game titles`)
  console.log(`❌ Failed to create: ${failCount} game titles`)
}

// Run the seeding
seedGameTitles().catch(error => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})