#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')

// Zodスキーマの定義（types/conference.tsからコピー）
const { z } = require('zod')

// カテゴリーのEnum
const CategorySchema = z.enum([
  'Web',
  'Mobile', 
  'Backend',
  'Frontend',
  'DevOps',
  'AI/ML',
  'Data',
  'Security',
  'Cloud',
  'General',
  'Design',
  'Testing',
  'IoT',
  'Game',
])

// プログラミング言語
const ProgrammingLanguagesSchema = z.enum([
  'JavaScript',
  'TypeScript',
  'PHP',
  'Ruby',
])

// 開催地情報
const LocationSchema = z.object({
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  prefecture: z.string(),
})

// カンファレンスの基本情報
const ConferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.array(CategorySchema),
  programmingLanguages: z.array(ProgrammingLanguagesSchema),
  website: z.string().url().optional(),
  twitter: z.string().optional(),
})

// 開催イベント情報
const ConferenceEventSchema = z.object({
  conferenceId: z.string(),
  year: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  location: LocationSchema,
  attendees: z.number().optional(),
  isOnline: z.boolean().default(false),
  isHybrid: z.boolean().default(false),
  eventUrl: z.string().url().optional(),
})

// スキーマを返す関数
function loadSchemas() {
  return { ConferenceSchema, ConferenceEventSchema }
}

// JSONファイルの検証
async function validateJson(filePath, schema, schemaName) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(content)
    
    if (Array.isArray(data)) {
      // 配列の場合（events）
      for (let i = 0; i < data.length; i++) {
        try {
          schema.parse(data[i])
        } catch (error) {
          console.error(`❌ ${filePath}[${i}]: ${schemaName} validation failed`)
          console.error(error.errors || error.message)
          return false
        }
      }
    } else {
      // オブジェクトの場合（conferences）
      schema.parse(data)
    }
    
    console.log(`✅ ${path.relative(process.cwd(), filePath)}: ${schemaName} validation passed`)
    return true
  } catch (error) {
    console.error(`❌ ${filePath}: ${schemaName} validation failed`)
    if (error.name === 'ZodError') {
      console.error(error.errors)
    } else {
      console.error(error.message)
    }
    return false
  }
}

// ディレクトリ内のJSONファイルを検証
async function validateDirectory(dirPath, schema, schemaName) {
  try {
    const files = await fs.readdir(dirPath)
    const jsonFiles = files.filter(file => file.endsWith('.json'))
    
    if (jsonFiles.length === 0) {
      console.log(`⚠️  No JSON files found in ${dirPath}`)
      return true
    }
    
    let allValid = true
    for (const file of jsonFiles) {
      const filePath = path.join(dirPath, file)
      const isValid = await validateJson(filePath, schema, schemaName)
      if (!isValid) {
        allValid = false
      }
    }
    
    return allValid
  } catch (error) {
    console.error(`❌ Failed to read directory ${dirPath}:`, error.message)
    return false
  }
}

// メイン関数
async function main() {
  console.log('🔍 Starting data validation...\n')
  
  try {
    const { ConferenceSchema, ConferenceEventSchema } = loadSchemas()
    
    const conferencesDir = path.join(process.cwd(), 'data', 'conferences')
    const eventsDir = path.join(process.cwd(), 'data', 'events')
    
    console.log('📁 Validating conferences data...')
    const conferencesValid = await validateDirectory(
      conferencesDir, 
      ConferenceSchema, 
      'Conference'
    )
    
    console.log('\n📁 Validating events data...')
    const eventsValid = await validateDirectory(
      eventsDir, 
      ConferenceEventSchema, 
      'ConferenceEvent'
    )
    
    console.log('\n' + '='.repeat(50))
    if (conferencesValid && eventsValid) {
      console.log('🎉 All data validation passed!')
      process.exit(0)
    } else {
      console.log('💥 Data validation failed!')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Failed to load schemas:', error.message)
    console.error('Make sure you have built the project first: npm run build')
    process.exit(1)
  }
}

// 直接実行時にメイン関数を呼び出し
if (require.main === module) {
  main()
}

module.exports = { main }