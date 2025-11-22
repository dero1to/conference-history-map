#!/usr/bin/env tsx

import { promises as fs } from 'fs'
import { join } from 'path'
import {
  ConferenceSchema,
  ConferenceEventSchema,
  VenueSchema
} from '../types/conference'

// JSONファイルの検証
async function validateJson(filePath: string, schema: any, schemaName: string): Promise<boolean> {
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
    
    console.log(`✅ ${join(process.cwd(), filePath).replace(process.cwd(), '').substring(1)}: ${schemaName} validation passed`)
    return true
  } catch (error) {
    console.error(`❌ ${filePath}: ${schemaName} validation failed`)
    if (error instanceof Error && error.name === 'ZodError') {
      console.error((error as any).errors)
    } else if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }
    return false
  }
}

// ディレクトリ内のJSONファイルを検証
async function validateDirectory(dirPath: string, schema: any, schemaName: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dirPath)
    const jsonFiles = files.filter(file => file.endsWith('.json'))
    
    if (jsonFiles.length === 0) {
      console.log(`⚠️  No JSON files found in ${dirPath}`)
      return true
    }
    
    let allValid = true
    for (const file of jsonFiles) {
      const filePath = join(dirPath, file)
      const isValid = await validateJson(filePath, schema, schemaName)
      if (!isValid) {
        allValid = false
      }
    }
    
    return allValid
  } catch (error) {
    console.error(`❌ Failed to read directory ${dirPath}:`, error instanceof Error ? error.message : error)
    return false
  }
}

// 会場ディレクトリを再帰的に検証
async function validateVenuesDirectory(venuesDir: string, schema: any, schemaName: string): Promise<boolean> {
  try {
    const prefectures = await fs.readdir(venuesDir)
    let allValid = true
    
    for (const prefecture of prefectures) {
      const prefecturePath = join(venuesDir, prefecture)
      
      // ディレクトリかどうか確認
      const stat = await fs.stat(prefecturePath)
      if (!stat.isDirectory()) continue
      
      const venueFiles = await fs.readdir(prefecturePath)
      const jsonFiles = venueFiles.filter(file => file.endsWith('.json'))
      
      for (const file of jsonFiles) {
        const filePath = join(prefecturePath, file)
        const isValid = await validateJson(filePath, schema, schemaName)
        if (!isValid) {
          allValid = false
        }
      }
    }
    
    return allValid
  } catch (error) {
    console.error(`❌ Failed to read venues directory ${venuesDir}:`, error instanceof Error ? error.message : error)
    return false
  }
}

// メイン関数
async function main() {
  console.log('🔍 Starting data validation...\n')
  
  try {
    const conferencesDir = join(process.cwd(), 'data', 'conferences')
    const eventsDir = join(process.cwd(), 'data', 'events')
    const venuesDir = join(process.cwd(), 'data', 'venues')
    
    console.log('📁 Validating conferences data...')
    const conferencesValid = await validateDirectory(
      conferencesDir, 
      ConferenceSchema, 
      'Conference'
    )
    
    console.log('\n📁 Validating venues data...')
    const venuesValid = await validateVenuesDirectory(
      venuesDir, 
      VenueSchema, 
      'Venue'
    )
    
    console.log('\n📁 Validating events data...')
    const eventsValid = await validateDirectory(
      eventsDir, 
      ConferenceEventSchema, 
      'ConferenceEvent'
    )
    
    console.log('\n' + '='.repeat(50))
    if (conferencesValid && venuesValid && eventsValid) {
      console.log('🎉 All data validation passed!')
      process.exit(0)
    } else {
      console.log('💥 Data validation failed!')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Failed to load schemas:', error instanceof Error ? error.message : error)
    console.error('Make sure you have built the project first: npm run build')
    process.exit(1)
  }
}

// 直接実行時にメイン関数を呼び出し
if (require.main === module) {
  main()
}

module.exports = { main }