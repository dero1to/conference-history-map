#!/usr/bin/env tsx

import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import { z } from 'zod'
import { ConferenceEventSchema, VenueSchema } from '../types/conference'

type ConferenceEvent = z.infer<typeof ConferenceEventSchema>
type Venue = z.infer<typeof VenueSchema>

type ParsedRow = {
  name: string
  eventUrl?: string
  startDate: string
  endDate: string
  year: number
  label: string
  prefecture: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const EVENTS_DIR = path.join(DATA_DIR, 'events')
const VENUES_DIR = path.join(DATA_DIR, 'venues')
const CONFERENCE_ID = 'regional-rubykaigi'
const BASE_URL = 'https://regional.rubykaigi.org/'

const prefectureDirMap: Record<string, string> = {
  '北海道': 'hokkaido', '青森県': 'aomori', '岩手県': 'iwate', '宮城県': 'miyagi', '秋田県': 'akita', '山形県': 'yamagata', '福島県': 'fukushima',
  '茨城県': 'ibaraki', '栃木県': 'tochigi', '群馬県': 'gunma', '埼玉県': 'saitama', '千葉県': 'chiba', '東京都': 'tokyo', '神奈川県': 'kanagawa',
  '新潟県': 'niigata', '富山県': 'toyama', '石川県': 'ishikawa', '福井県': 'fukui', '山梨県': 'yamanashi', '長野県': 'nagano', '岐阜県': 'gifu',
  '静岡県': 'shizuoka', '愛知県': 'aichi', '三重県': 'mie', '滋賀県': 'shiga', '京都府': 'kyoto', '大阪府': 'osaka', '兵庫県': 'hyogo',
  '奈良県': 'nara', '和歌山県': 'wakayama', '鳥取県': 'tottori', '島根県': 'shimane', '岡山県': 'okayama', '広島県': 'hiroshima', '山口県': 'yamaguchi',
  '徳島県': 'tokushima', '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi', '福岡県': 'fukuoka', '佐賀県': 'saga', '長崎県': 'nagasaki',
  '熊本県': 'kumamoto', '大分県': 'oita', '宮崎県': 'miyazaki', '鹿児島県': 'kagoshima', '沖縄県': 'okinawa'
}

const locationHints: { keywords: string[]; prefecture: string; label: string }[] = [
  { keywords: ['tokyo', 'tokyu', 'oedo', 'edo'], prefecture: '東京都', label: '東京' },
  { keywords: ['kansai'], prefecture: '大阪府', label: '関西' },
  { keywords: ['osaka'], prefecture: '大阪府', label: '大阪' },
  { keywords: ['kobe'], prefecture: '兵庫県', label: '神戸' },
  { keywords: ['kyoto'], prefecture: '京都府', label: '京都' },
  { keywords: ['nagoya'], prefecture: '愛知県', label: '名古屋' },
  { keywords: ['hokuriku'], prefecture: '石川県', label: '北陸' },
  { keywords: ['matsue'], prefecture: '島根県', label: '松江' },
  { keywords: ['izumo'], prefecture: '島根県', label: '出雲' },
  { keywords: ['nagara'], prefecture: '岐阜県', label: '長良' },
  { keywords: ['fukuoka'], prefecture: '福岡県', label: '福岡' },
  { keywords: ['kumamoto'], prefecture: '熊本県', label: '熊本' },
  { keywords: ['miyazaki'], prefecture: '宮崎県', label: '宮崎' },
  { keywords: ['oita'], prefecture: '大分県', label: '大分' },
  { keywords: ['yokohama', 'shonan'], prefecture: '神奈川県', label: '神奈川' },
  { keywords: ['sendai', 'tohoku'], prefecture: '宮城県', label: '仙台' },
  { keywords: ['hokkaido', 'sapporo'], prefecture: '北海道', label: '北海道' }
]

async function fetchHtml(): Promise<string> {
  const res = await fetch(BASE_URL, {
    headers: { 'User-Agent': 'conference-history-map importer' }
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${BASE_URL}: ${res.status} ${res.statusText}`)
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

function guessLocation(name: string): { prefecture: string; label: string } {
  const lower = name.toLowerCase()
  for (const hint of locationHints) {
    if (hint.keywords.some(k => lower.includes(k))) {
      return { prefecture: hint.prefecture, label: hint.label }
    }
  }
  const fallback = name.replace(/Ruby会議|Rubyist会議/gi, '').trim() || '東京'
  return { prefecture: '東京都', label: fallback }
}

function parseDateRange(dateText: string): { startDate: string; endDate: string; year: number } | null {
  const cleaned = cleanText(dateText).replace(/\(.*?\)/g, '')
  const rangeMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})(?:[-/](\d{2}))?/)
  if (!rangeMatch) return null

  const year = parseInt(rangeMatch[1], 10)
  const month = parseInt(rangeMatch[2], 10)
  const day = parseInt(rangeMatch[3], 10)
  const endDay = rangeMatch[4] ? parseInt(rangeMatch[4], 10) : day

  const startDate = `${rangeMatch[1]}-${rangeMatch[2]}-${rangeMatch[3]}`
  const endDate = `${rangeMatch[1]}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`

  return { startDate, endDate, year }
}

function parseRows(html: string): ParsedRow[] {
  const tableMatch = html.match(/<table>([\s\S]*?)<\/table>/)
  const table = tableMatch ? tableMatch[1] : html
  const rows: ParsedRow[] = []

  const trRegex = /<tr>([\s\S]*?)<\/tr>/g
  let match: RegExpExecArray | null

  while ((match = trRegex.exec(table)) !== null) {
    const cells = Array.from(match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)).map(m => m[1])
    if (cells.length < 2) continue

    const dateInfo = parseDateRange(cells[0])
    if (!dateInfo) continue

    const nameCell = cells[1]
    const urlMatch = nameCell.match(/href="([^"]*?)"/)
    const eventUrl = urlMatch ? new URL(urlMatch[1], BASE_URL).toString() : undefined
    const name = cleanText(nameCell)

    const { prefecture, label } = guessLocation(name)

    rows.push({
      name,
      eventUrl,
      startDate: dateInfo.startDate,
      endDate: dateInfo.endDate,
      year: dateInfo.year,
      prefecture,
      label
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

async function ensureConferenceReference(): Promise<void> {
  const conferencePath = path.join(DATA_DIR, 'conferences', `${CONFERENCE_ID}.json`)
  try {
    await fs.access(conferencePath)
  } catch {
    console.log(chalk.yellow(`⚠️  ${conferencePath} not found. Add conference metadata manually before validation.`))
  }
}

async function main() {
  console.log(chalk.bold.blue('Importing Regional RubyKaigi list...'))
  await ensureConferenceReference()

  const html = await fetchHtml()
  const rows = parseRows(html)

  if (rows.length === 0) {
    console.log(chalk.red('No events parsed. Check parser logic or source HTML.'))
    return
  }

  console.log(chalk.cyan(`Parsed ${rows.length} rows from Regional RubyKaigi.`))

  for (const row of rows) {
    const venueId = `id-${slugify(row.label) || 'venue'}`

    const venue: Venue = {
      id: venueId,
      name: `Regional RubyKaigi (${row.label})`,
      address: row.label,
      lat: 0.0,
      lng: 0.0,
      prefecture: row.prefecture
    }

    const venuePathId = await upsertVenue(row.prefecture, venue)

    const event: ConferenceEvent = {
      conferenceId: CONFERENCE_ID,
      name: row.name,
      year: row.year,
      startDate: row.startDate,
      endDate: row.endDate,
      venueId: venuePathId,
      isHybrid: false,
      eventUrl: row.eventUrl
    }

    await upsertEvent(event)
  }

  console.log(chalk.bold.green('Finished importing Regional RubyKaigi events.'))
}

main().catch(err => {
  console.error(chalk.red('Import failed:'), err instanceof Error ? err.message : err)
  process.exit(1)
})
