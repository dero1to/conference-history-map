#!/usr/bin/env tsx

import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import { z } from 'zod'
import { ConferenceEventSchema, VenueSchema } from '../types/conference'

type ConferenceEvent = z.infer<typeof ConferenceEventSchema>
type Venue = z.infer<typeof VenueSchema>

type OspnRow = {
  year: number
  dateText: string
  title: string
  url: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const EVENTS_DIR = path.join(DATA_DIR, 'events')
const VENUES_DIR = path.join(DATA_DIR, 'venues')
const SOURCE_URL = 'https://www.ospn.jp/eventlist'

const prefectureDirMap: Record<string, string> = {
  '北海道': 'hokkaido', '青森県': 'aomori', '岩手県': 'iwate', '宮城県': 'miyagi', '秋田県': 'akita', '山形県': 'yamagata', '福島県': 'fukushima',
  '茨城県': 'ibaraki', '栃木県': 'tochigi', '群馬県': 'gunma', '埼玉県': 'saitama', '千葉県': 'chiba', '東京都': 'tokyo', '神奈川県': 'kanagawa',
  '新潟県': 'niigata', '富山県': 'toyama', '石川県': 'ishikawa', '福井県': 'fukui', '山梨県': 'yamanashi', '長野県': 'nagano', '岐阜県': 'gifu',
  '静岡県': 'shizuoka', '愛知県': 'aichi', '三重県': 'mie', '滋賀県': 'shiga', '京都府': 'kyoto', '大阪府': 'osaka', '兵庫県': 'hyogo',
  '奈良県': 'nara', '和歌山県': 'wakayama', '鳥取県': 'tottori', '島根県': 'shimane', '岡山県': 'okayama', '広島県': 'hiroshima', '山口県': 'yamaguchi',
  '徳島県': 'tokushima', '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi', '福岡県': 'fukuoka', '佐賀県': 'saga', '長崎県': 'nagasaki',
  '熊本県': 'kumamoto', '大分県': 'oita', '宮崎県': 'miyazaki', '鹿児島県': 'kagoshima', '沖縄県': 'okinawa'
}

const prefectureGuess: Record<string, string> = {
  tokyo: '東京都',
  hokkaido: '北海道',
  kansai: '大阪府',
  osaka: '大阪府',
  kyoto: '京都府',
  nagoya: '愛知県',
  aichi: '愛知県',
  okinawa: '沖縄県',
  fukuoka: '福岡県',
  niigata: '新潟県',
  nagaoka: '新潟県',
  oita: '大分県',
  nagano: '長野県',
  kobe: '兵庫県',
  hyogo: '兵庫県',
  hiroshima: '広島県',
  sendai: '宮城県',
  sapporo: '北海道',
  saitama: '埼玉県',
  yokohama: '神奈川県',
  kanagawa: '神奈川県'
}

async function fetchHtml(): Promise<string> {
  const res = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'conference-history-map importer' }
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${SOURCE_URL}: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

function cleanText(input: string): string {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/\r/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[()\[\]{}]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function guessLocationFromTitle(title: string): { prefecture: string, label: string } {
  const parenMatch = title.match(/[（(]([^()（）]+)[)）]/)
  const lowerTitle = title.toLowerCase()
  const hint = parenMatch?.[1] || title.split(' ').slice(-1)[0] || 'Tokyo'
  const lowerHint = hint.toLowerCase()

  for (const [key, pref] of Object.entries(prefectureGuess)) {
    if (lowerTitle.includes(key) || lowerHint.includes(key)) {
      return { prefecture: pref, label: hint }
    }
  }

  return { prefecture: '東京都', label: hint }
}

function parseDateRange(year: number, dateText: string): { startDate: string, endDate: string } {
  const normalized = dateText
    .replace(/\s+/g, '')
    .replace(/－|〜|～/g, '-')
    .replace(/[．.]/g, '/')
    .replace(/[年月]/g, '/')
    .replace(/日/g, '')
    .replace(/^(\d+)-(\d{1,2})-/, '$1/$2-')
    .replace(/--+/g, '-')

  const range = normalized.split('-').filter(Boolean)
  const startPart = range[0] || normalized
  const endPart = range[1] || startPart

  const start = parseMonthDay(startPart, year)
  const end = parseMonthDay(endPart, year, start.month)

  return {
    startDate: formatDate(year, start.month, start.day),
    endDate: formatDate(year, end.month, end.day)
  }
}

function parseMonthDay(part: string, year: number, fallbackMonth?: number): { month: number, day: number } {
  const hasSlash = part.includes('/')
  const [first, second] = part.split('/')

  const month = hasSlash ? parseInt(first, 10) : (fallbackMonth || 1)
  const day = hasSlash ? parseInt(second, 10) : parseInt(first, 10)

  const safeMonth = Number.isFinite(month) && month >= 1 && month <= 12 ? month : 1
  const safeDay = Number.isFinite(day) && day >= 1 && day <= 31 ? day : 1

  return { month: safeMonth, day: safeDay }
}

function formatDate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function parseRows(html: string): OspnRow[] {
  const rows: OspnRow[] = []
  const rowRegex = /<div class="row border-bottom">\s*<div class="col[^>]*">([\s\S]*?)<\/div>\s*<div class="col[^>]*">([\s\S]*?)<\/div>\s*<div class="col[^>]*">([\s\S]*?)<\/div>\s*<div class="col[^>]*"><a href="([^"]*?)"[^>]*>([\s\S]*?)<\/a><\/div>\s*<div class="col[^>]*">([\s\S]*?)<\/div>\s*<div class="col[^>]*">([\s\S]*?)<\/div>\s*<div class="col[^>]*">([\s\S]*?)<\/div>\s*<\/div>/g

  let match: RegExpExecArray | null
  while ((match = rowRegex.exec(html)) !== null) {
    const year = parseInt(cleanText(match[2]), 10)
    if (!year) continue

    rows.push({
      year,
      dateText: cleanText(match[3]),
      title: cleanText(match[5]),
      url: cleanText(match[4])
    })
  }

  return rows
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    return null
  }
}

async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n')
}

async function upsertVenue(prefecture: string, venue: Venue): Promise<string> {
  const prefDir = prefectureDirMap[prefecture] || 'tokyo'
  const venuesFilePath = path.join(VENUES_DIR, prefDir, 'venues.json')
  const venues = (await readJson<Venue[]>(venuesFilePath)) || []
  const existingIndex = venues.findIndex(v => v.id === venue.id)

  if (existingIndex >= 0) {
    return `${prefDir}/${venue.id}`
  }

  venues.push(venue)
  await writeJson(venuesFilePath, venues)
  console.log(chalk.green(`🆕 Added venue: ${venue.name} -> ${prefDir}/venues.json`))
  return `${prefDir}/${venue.id}`
}

async function upsertEvent(event: ConferenceEvent): Promise<void> {
  const eventFilePath = path.join(EVENTS_DIR, `${event.year}.json`)
  const events = (await readJson<ConferenceEvent[]>(eventFilePath)) || []
  const exists = events.find(e => e.conferenceId === event.conferenceId && e.name === event.name)

  if (exists) return

  events.push(event)
  events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  await writeJson(eventFilePath, events)
  console.log(chalk.green(`🆕 Added event: ${event.name} (${event.year})`))
}

async function main() {
  console.log(chalk.bold.blue('Importing OSPN event list...'))
  const html = await fetchHtml()
  const rows = parseRows(html)

  if (rows.length === 0) {
    console.log(chalk.red('No events parsed. Check parser logic or source HTML.'))
    return
  }

  console.log(chalk.cyan(`Parsed ${rows.length} rows from OSPN.`))

  for (const row of rows) {
    const { prefecture, label } = guessLocationFromTitle(row.title)
    const venueId = `id-${slugify(label) || 'venue'}`
    const { startDate, endDate } = parseDateRange(row.year, row.dateText)

    const venue: Venue = {
      id: venueId,
      name: `OSPN会場 (${label})`,
      address: label,
      lat: 0.0,
      lng: 0.0,
      prefecture
    }

    const event: ConferenceEvent = {
      conferenceId: 'osc',
      name: row.title,
      year: row.year,
      startDate,
      endDate,
      venueId: `${prefectureDirMap[prefecture] || 'tokyo'}/${venueId}`,
      isHybrid: false,
      eventUrl: row.url || undefined
    }

    await upsertVenue(prefecture, venue)
    await upsertEvent(event)
  }

  console.log(chalk.bold.green('Finished importing OSPN events.'))
}

main().catch(err => {
  console.error(chalk.red('Import failed:'), err instanceof Error ? err.message : err)
  process.exit(1)
})
