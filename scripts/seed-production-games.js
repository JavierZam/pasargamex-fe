#!/usr/bin/env node

const API_BASE_URL = 'https://pasargamex-api-244929333106.asia-southeast2.run.app'

const gameData = [
  {
    name: 'Genshin Impact',
    description: 'Genshin Impact is an open-world action RPG game developed and published by miHoYo. Explore the magical world of Teyvat with your favorite characters.',
    icon: 'https://example.com/genshin-impact-icon.jpg',
    banner: 'https://example.com/genshin-impact-banner.jpg',
    attributes: [
      {
        name: 'Adventure Rank',
        type: 'number',
        required: true,
        description: "Player's adventure rank level"
      },
      {
        name: 'Server',
        type: 'select',
        required: true,
        options: ['America', 'Europe', 'Asia', 'TW/HK/MO'],
        description: 'Game server region'
      },
      {
        name: '5-Star Characters',
        type: 'number',
        required: false,
        description: 'Number of 5-star characters owned'
      },
      {
        name: '5-Star Weapons',
        type: 'number',
        required: false,
        description: 'Number of 5-star weapons owned'
      },
      {
        name: 'Has Primogems',
        type: 'boolean',
        required: false,
        description: 'Whether the account has primogems saved'
      }
    ],
    status: 'active'
  },
  {
    name: 'Honkai Star Rail',
    description: 'Honkai Star Rail Turn Base Hoyoverse Game. Experience epic space fantasy adventures with turn-based combat system.',
    icon: 'https://example.com/honkai-star-rail-icon.jpg',
    banner: 'https://example.com/honkai-star-rail-banner.jpg',
    attributes: [
      {
        name: 'Account Type',
        type: 'select',
        required: true,
        options: ['Starter', 'Mid-game', 'Endgame'],
        description: 'Account Progress Type'
      },
      {
        name: 'TL',
        type: 'number',
        required: true,
        description: 'Trailblaze Level'
      },
      {
        name: 'Character Count',
        type: 'number',
        required: false,
        description: 'Number of characters owned'
      },
      {
        name: 'Server',
        type: 'select',
        required: true,
        options: ['ASIA', 'AMERICA', 'EU', 'TW, HK, MO'],
        description: 'Server region'
      }
    ],
    status: 'active'
  },
  {
    name: 'Valorant',
    description: 'Tactical 5v5 character-based tactical FPS by Riot Games. Master unique agents and compete in ranked matches.',
    icon: 'https://example.com/valorant-icon.jpg',
    banner: 'https://example.com/valorant-banner.jpg',
    attributes: [
      {
        name: 'Current Rank',
        type: 'select',
        required: true,
        options: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'],
        description: 'Current competitive rank'
      },
      {
        name: 'Peak Rank',
        type: 'select',
        required: false,
        options: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'],
        description: 'Highest achieved rank'
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
        type: 'number',
        required: false,
        description: 'Number of unlocked agents'
      },
      {
        name: 'Skins Count',
        type: 'number',
        required: false,
        description: 'Number of weapon skins owned'
      }
    ],
    status: 'active'
  },
  {
    name: 'Mobile Legends: Bang Bang',
    description: 'Popular 5v5 MOBA game designed for mobile devices. Battle with friends in the most popular mobile MOBA!',
    icon: 'https://example.com/mobile-legends-icon.jpg',
    banner: 'https://example.com/mobile-legends-banner.jpg',
    attributes: [
      {
        name: 'Current Rank',
        type: 'select',
        required: true,
        options: ['Warrior', 'Elite', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic', 'Mythical Glory'],
        description: 'Current rank in ranked mode'
      },
      {
        name: 'Mythic Points',
        type: 'number',
        required: false,
        description: 'Points in Mythic rank (if applicable)'
      },
      {
        name: 'Server ID',
        type: 'string',
        required: true,
        description: 'Game server ID'
      },
      {
        name: 'Heroes Owned',
        type: 'number',
        required: false,
        description: 'Number of heroes owned'
      },
      {
        name: 'Skins Count',
        type: 'number',
        required: false,
        description: 'Number of hero skins owned'
      }
    ],
    status: 'active'
  },
  {
    name: 'Free Fire',
    description: 'Battle royale game on mobile platforms developed by 111dots Studio. Survive and be the last one standing!',
    icon: 'https://example.com/free-fire-icon.jpg',
    banner: 'https://example.com/free-fire-banner.jpg',
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
        type: 'number',
        required: false,
        description: 'Number of characters owned'
      },
      {
        name: 'Pets Count',
        type: 'number',
        required: false,
        description: 'Number of pets owned'
      },
      {
        name: 'Diamonds',
        type: 'number',
        required: false,
        description: 'Current diamond balance'
      }
    ],
    status: 'active'
  },
  {
    name: 'PUBG Mobile',
    description: 'Battle royale game adapted from PlayerUnknown\'s Battlegrounds for mobile. Drop, loot, and survive!',
    icon: 'https://example.com/pubg-mobile-icon.jpg',
    banner: 'https://example.com/pubg-mobile-banner.jpg',
    attributes: [
      {
        name: 'Current Tier',
        type: 'select',
        required: true,
        options: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'],
        description: 'Current rank tier'
      },
      {
        name: 'RP Points',
        type: 'number',
        required: false,
        description: 'Current season RP points'
      },
      {
        name: 'Server',
        type: 'select',
        required: true,
        options: ['Global', 'Korea', 'Vietnam', 'Nordic Map'],
        description: 'Server region'
      },
      {
        name: 'Outfits Count',
        type: 'number',
        required: false,
        description: 'Number of outfits owned'
      },
      {
        name: 'UC Balance',
        type: 'number',
        required: false,
        description: 'Current UC balance'
      }
    ],
    status: 'active'
  },
  {
    name: 'Call of Duty Mobile',
    description: 'First-person shooter mobile game in the Call of Duty franchise. Experience console-quality FPS on mobile!',
    icon: 'https://example.com/cod-mobile-icon.jpg',
    banner: 'https://example.com/cod-mobile-banner.jpg',
    attributes: [
      {
        name: 'MP Rank',
        type: 'select',
        required: true,
        options: ['Rookie', 'Veteran', 'Elite', 'Pro', 'Master', 'Grandmaster', 'Legendary'],
        description: 'Multiplayer rank'
      },
      {
        name: 'BR Rank',
        type: 'select',
        required: true,
        options: ['Rookie', 'Veteran', 'Elite', 'Pro', 'Master', 'Grandmaster', 'Legendary'],
        description: 'Battle Royale rank'
      },
      {
        name: 'Level',
        type: 'number',
        required: true,
        description: 'Player level'
      },
      {
        name: 'Weapons Count',
        type: 'number',
        required: false,
        description: 'Number of weapons unlocked'
      },
      {
        name: 'CP Balance',
        type: 'number',
        required: false,
        description: 'Current CP (COD Points) balance'
      }
    ],
    status: 'active'
  },
  {
    name: 'Arena of Valor',
    description: 'Multiplayer Online Battle Arena (MOBA) developed by TiMi Studio Group. Master the arena with strategic gameplay!',
    icon: 'https://example.com/aov-icon.jpg',
    banner: 'https://example.com/aov-banner.jpg',
    attributes: [
      {
        name: 'Current Rank',
        type: 'select',
        required: true,
        options: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Conqueror'],
        description: 'Current ranked tier'
      },
      {
        name: 'Stars',
        type: 'number',
        required: false,
        description: 'Stars in current rank'
      },
      {
        name: 'Heroes Owned',
        type: 'number',
        required: false,
        description: 'Number of heroes owned'
      },
      {
        name: 'Skins Count',
        type: 'number',
        required: false,
        description: 'Number of hero skins owned'
      }
    ],
    status: 'active'
  }
]

async function createGameTitle(gameTitle, authToken) {
  try {
    console.log(`🎮 Creating: ${gameTitle.name}`)
    
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
      console.log(`✅ Success: ${gameTitle.name}`)
      console.log(`   📝 ID: ${result.data?.id || 'Unknown'}`)
      console.log(`   🔗 Slug: ${result.data?.slug || 'Unknown'}`)
      return result
    } else {
      console.log(`❌ Failed: ${gameTitle.name}`)
      console.log(`   📝 Status: ${response.status}`)
      console.log(`   💬 Message: ${result.error?.message || result.message || 'Unknown error'}`)
      return null
    }
  } catch (error) {
    console.log(`❌ Error creating ${gameTitle.name}:`, error.message)
    return null
  }
}

async function checkExistingGames(authToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/game-titles?limit=50`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    const result = await response.json()
    
    if (response.ok && result.data && Array.isArray(result.data)) {
      console.log(`📊 Found ${result.data.length} existing game titles:`)
      result.data.forEach(game => {
        console.log(`   🎮 ${game.name} (${game.slug}) - ${game.status}`)
      })
      return result.data.map(game => game.name.toLowerCase())
    } else {
      console.log('📊 No existing games found or error occurred')
      return []
    }
  } catch (error) {
    console.log('📊 Error checking existing games:', error.message)
    return []
  }
}

async function seedGameTitles() {
  const authToken = process.env.ADMIN_TOKEN
  
  if (!authToken) {
    console.log('❌ ADMIN_TOKEN environment variable is required')
    console.log('💡 Usage: ADMIN_TOKEN=your_admin_token node scripts/seed-production-games.js')
    console.log('')
    console.log('📝 To get admin token:')
    console.log('   1. Login as admin user')
    console.log('   2. Get the JWT token from the response')
    console.log('   3. Use that token as ADMIN_TOKEN')
    process.exit(1)
  }

  console.log('🌱 Starting to seed game titles...')
  console.log(`🌐 API URL: ${API_BASE_URL}`)
  console.log(`🔑 Using admin token: ${authToken.substring(0, 20)}...`)
  console.log('')

  // Check existing games first
  console.log('🔍 Checking existing game titles...')
  const existingGames = await checkExistingGames(authToken)
  console.log('')
  
  let successCount = 0
  let skipCount = 0
  let failCount = 0

  for (const gameTitle of gameData) {
    // Skip if game already exists
    if (existingGames.includes(gameTitle.name.toLowerCase())) {
      console.log(`⏭️  Skipping: ${gameTitle.name} (already exists)`)
      skipCount++
      continue
    }

    const result = await createGameTitle(gameTitle, authToken)
    if (result) {
      successCount++
    } else {
      failCount++
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('')
  }

  console.log('🏁 Seeding complete!')
  console.log(`✅ Successfully created: ${successCount} game titles`)
  console.log(`⏭️  Skipped (existing): ${skipCount} game titles`)
  console.log(`❌ Failed to create: ${failCount} game titles`)
  console.log('')
  
  if (successCount > 0) {
    console.log('🎯 Next steps:')
    console.log('   1. Update the icon and banner URLs with real images')
    console.log('   2. Upload images to your storage service')
    console.log('   3. Update each game title with the correct image URLs')
    console.log('   4. Test the frontend integration')
  }
}

// Show help if no arguments
if (process.argv.length === 2) {
  console.log('🎮 PasargameX Game Titles Seeder')
  console.log('')
  console.log('📝 Usage:')
  console.log('   ADMIN_TOKEN=your_admin_token node scripts/seed-production-games.js')
  console.log('')
  console.log('🎯 This script will create game titles for:')
  gameData.forEach((game, index) => {
    console.log(`   ${index + 1}. ${game.name}`)
  })
  console.log('')
  console.log('⚠️  Note: Images URLs are placeholder - update them after running this script')
  process.exit(0)
}

// Run the seeding
seedGameTitles().catch(error => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})