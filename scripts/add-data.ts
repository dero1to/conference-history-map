#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { translate } from 'google-translate-api-x';
import { z } from 'zod';
import {
    CategorySchema,
    ProgrammingLanguagesSchema,
    PrefecturesSchema,
    ConferenceSchema,
    ConferenceEventSchema,
    VenueSchema
} from '../types/conference';

// Define types based on schemas
type Conference = z.infer<typeof ConferenceSchema>;
type ConferenceEvent = z.infer<typeof ConferenceEventSchema>;
type Venue = z.infer<typeof VenueSchema>;

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFERENCES_DIR = path.join(DATA_DIR, 'conferences');
const EVENTS_DIR = path.join(DATA_DIR, 'events');
const VENUES_DIR = path.join(DATA_DIR, 'venues');

const prefectureDirMap: Record<string, string> = {
    '北海道': 'hokkaido', '青森県': 'aomori', '岩手県': 'iwate', '宮城県': 'miyagi', '秋田県': 'akita', '山形県': 'yamagata', '福島県': 'fukushima',
    '茨城県': 'ibaraki', '栃木県': 'tochigi', '群馬県': 'gunma', '埼玉県': 'saitama', '千葉県': 'chiba', '東京都': 'tokyo', '神奈川県': 'kanagawa',
    '新潟県': 'niigata', '富山県': 'toyama', '石川県': 'ishikawa', '福井県': 'fukui', '山梨県': 'yamanashi', '長野県': 'nagano', '岐阜県': 'gifu',
    '静岡県': 'shizuoka', '愛知県': 'aichi', '三重県': 'mie', '滋賀県': 'shiga', '京都府': 'kyoto', '大阪府': 'osaka', '兵庫県': 'hyogo',
    '奈良県': 'nara', '和歌山県': 'wakayama', '鳥取県': 'tottori', '島根県': 'shimane', '岡山県': 'okayama', '広島県': 'hiroshima', '山口県': 'yamaguchi',
    '徳島県': 'tokushima', '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi', '福岡県': 'fukuoka', '佐賀県': 'saga', '長崎県': 'nagasaki',
    '熊本県': 'kumamoto', '大分県': 'oita', '宮崎県': 'miyazaki', '鹿児島県': 'kagoshima', '沖縄県': 'okinawa'
};

// Helper to read JSON file
async function readJson<T>(filePath: string): Promise<T | null> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

// Helper to write JSON file
async function writeJson(filePath: string, data: any) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

// Geocoding function using OpenStreetMap Nominatim API
async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
    const spinner = ora(`Geocoding: ${query}...`).start();
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'ConferenceHistoryMap/1.0',
                },
            }
        );
        const data = await response.json() as any[];
        spinner.stop();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                display_name: data[0].display_name,
            };
        }
        return null;
    } catch (error) {
        spinner.stop();
        return null;
    }
}

// Helper to translate Japanese to English slug
async function translateToSlug(text: string): Promise<string> {
    const spinner = ora('Translating name for ID...').start();
    try {
        const res = await translate(text, { to: 'en' });
        spinner.stop();
        // Slugify: lowercase, remove special chars, replace spaces with hyphens
        return res.text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    } catch (error) {
        spinner.stop();
        return '';
    }
}

async function main() {
    console.log(chalk.bold.blue('🗺️  Conference History Map Data Entry Tool 🗺️\n'));

    // 1. Select Mode
    const { mode } = await prompts({
        type: 'select',
        name: 'mode',
        message: 'What would you like to do?',
        choices: [
            { title: 'Add Event to Existing Conference', value: 'add_event' },
            { title: 'Add New Conference', value: 'add_conference' },
        ],
    });

    if (!mode) return;

    let conferenceId: string;
    let conferenceName: string;

    // 2. Handle Conference Selection/Creation
    if (mode === 'add_conference') {
        const confData = await prompts([
            {
                type: 'text',
                name: 'name',
                message: 'Conference Name:',
                validate: (value: string) => value.length > 0 ? true : 'Name is required',
            },
            {
                type: 'text',
                name: 'id',
                message: 'Conference ID (e.g. jsconf-jp):',
                initial: (prev: string) => prev.toLowerCase().replace(/\s+/g, '-'),
                validate: async (value: string) => {
                    if (!/^[a-z0-9-]+$/.test(value)) return 'ID must be lowercase alphanumeric and hyphens';
                    const exists = await fs.stat(path.join(CONFERENCES_DIR, `${value}.json`)).then(() => true).catch(() => false);
                    return exists ? 'Conference ID already exists' : true;
                },
            },
            {
                type: 'multiselect',
                name: 'category',
                message: 'Categories:',
                choices: CategorySchema.options.map(c => ({ title: c, value: c })),
                min: 1,
            },
            {
                type: 'multiselect',
                name: 'programmingLanguages',
                message: 'Programming Languages:',
                choices: ProgrammingLanguagesSchema.options.map(l => ({ title: l, value: l })),
            },
            {
                type: 'text',
                name: 'website',
                message: 'Website URL (optional):',
            },
            {
                type: 'text',
                name: 'twitter',
                message: 'Twitter/X Handle (optional):',
            },
        ]);

        if (!confData.name) return;

        const newConference: Conference = {
            id: confData.id,
            name: confData.name,
            category: confData.category,
            programmingLanguages: confData.programmingLanguages,
            website: confData.website || undefined,
            twitter: confData.twitter || undefined,
        };

        await writeJson(path.join(CONFERENCES_DIR, `${confData.id}.json`), newConference);
        console.log(chalk.green(`✅ Created conference: ${confData.name} (${confData.id})`));

        conferenceId = confData.id;
        conferenceName = confData.name;

    } else {
        // List existing conferences
        const files = await fs.readdir(CONFERENCES_DIR);
        const conferences = await Promise.all(
            files.filter(f => f.endsWith('.json')).map(async f => {
                const data = await readJson<Conference>(path.join(CONFERENCES_DIR, f));
                return data;
            })
        );

        const { selectedConfId } = await prompts({
            type: 'autocomplete',
            name: 'selectedConfId',
            message: 'Select Conference:',
            choices: conferences
                .filter((c): c is Conference => c !== null)
                .map(c => ({ title: c.name, value: c.id })),
        });

        if (!selectedConfId) return;
        conferenceId = selectedConfId;
        conferenceName = conferences.find(c => c?.id === conferenceId)?.name || '';
    }

    // 3. Event Details
    console.log(chalk.bold(`\n📅 Adding Event for ${conferenceName}`));

    const eventData = await prompts([
        {
            type: 'number',
            name: 'year',
            message: 'Event Year:',
            initial: new Date().getFullYear(),
        },
        {
            type: 'text',
            name: 'startDate',
            message: 'Start Date (YYYY-MM-DD):',
            initial: (prev: string) => `${prev}-`,
            validate: (val: string) => /^\d{4}-\d{2}-\d{2}$/.test(val) ? true : 'Invalid date format',
        },
        {
            type: 'text',
            name: 'endDate',
            message: 'End Date (YYYY-MM-DD):',
            initial: (prev: string, values: any) => values.startDate,
            validate: (val: string) => /^\d{4}-\d{2}-\d{2}$/.test(val) ? true : 'Invalid date format',
        },
        {
            type: 'text',
            name: 'eventUrl',
            message: 'Event URL (optional):',
        },
        {
            type: 'confirm',
            name: 'isHybrid',
            message: 'Is this a hybrid event (Online + Offline)?',
            initial: false,
        },
    ]);

    if (!eventData.year) return;

    // 4. Venue Selection
    console.log(chalk.bold('\n📍 Venue Details'));

    const { venueAction } = await prompts({
        type: 'select',
        name: 'venueAction',
        message: 'Select Venue:',
        choices: [
            { title: 'Search Existing Venue', value: 'search' },
            { title: 'Create New Venue', value: 'create' },
        ],
    });

    let venueId: string = '';

    if (venueAction === 'search') {
        // Load all venues
        const prefectureDirs = await fs.readdir(VENUES_DIR);
        const allVenues: { venue: Venue, prefDir: string }[] = [];

        for (const pref of prefectureDirs) {
            const prefPath = path.join(VENUES_DIR, pref);
            const stat = await fs.stat(prefPath);
            if (stat.isDirectory()) {
                const files = await fs.readdir(prefPath);
                for (const file of files) {
                    if (file === 'venues.json') {
                        // Handle array of venues
                        const venues = await readJson<Venue[]>(path.join(prefPath, file));
                        if (venues && Array.isArray(venues)) {
                            venues.forEach(v => allVenues.push({ venue: v, prefDir: pref }));
                        }
                    } else if (file.endsWith('.json')) {
                        // Handle single venue file (legacy or mixed)
                        const venue = await readJson<Venue>(path.join(prefPath, file));
                        if (venue && !Array.isArray(venue)) {
                            allVenues.push({ venue, prefDir: pref });
                        }
                    }
                }
            }
        }

        const { selectedVenue } = await prompts({
            type: 'autocomplete',
            name: 'selectedVenue',
            message: 'Search Venue:',
            choices: allVenues.map(v => ({
                title: `${v.venue.name} (${v.venue.prefecture})`,
                value: { id: v.venue.id, prefDir: v.prefDir }
            })),
        });

        if (!selectedVenue) return;
        // Construct venueId as {prefDir}/{venueId}
        venueId = `${selectedVenue.prefDir}/${selectedVenue.id}`;

    } else {
        // Create New Venue
        const venueData = await prompts([
            {
                type: 'text',
                name: 'name',
                message: 'Venue Name:',
                validate: (val: string) => val.length > 0 ? true : 'Required',
            },
            {
                type: 'text',
                name: 'address',
                message: 'Address (for geocoding):',
                validate: (val: string) => val.length > 0 ? true : 'Required',
            },
        ]);

        if (!venueData.name) return;

        // Geocode: Try address first, then name
        let geoResult = await geocodeAddress(venueData.address);
        if (!geoResult) {
            console.log(chalk.yellow('Address not found, trying venue name...'));
            geoResult = await geocodeAddress(venueData.name);
        }

        // Fallback: Try first part of name if it contains spaces
        if (!geoResult && venueData.name.includes(' ')) {
            const shortName = venueData.name.split(' ')[0];
            console.log(chalk.yellow(`Venue name not found, trying first part: "${shortName}"...`));
            geoResult = await geocodeAddress(shortName);
        }

        let lat = 0;
        let lng = 0;

        if (geoResult) {
            console.log(chalk.cyan(`Found location: ${geoResult.display_name}`));
            console.log(chalk.cyan(`Lat: ${geoResult.lat}, Lng: ${geoResult.lng}`));

            const { confirmGeo } = await prompts({
                type: 'confirm',
                name: 'confirmGeo',
                message: 'Use this location?',
                initial: true,
            });

            if (confirmGeo) {
                lat = geoResult.lat;
                lng = geoResult.lng;
            }
        }

        if (lat === 0) {
            const manualGeo = await prompts([
                { type: 'number', name: 'lat', message: 'Latitude:', float: true },
                { type: 'number', name: 'lng', message: 'Longitude:', float: true },
            ]);
            lat = manualGeo.lat;
            lng = manualGeo.lng;
        }

        const { prefecture } = await prompts({
            type: 'select',
            name: 'prefecture',
            message: 'Prefecture:',
            choices: PrefecturesSchema.options.map(p => ({ title: p, value: p })),
        });

        const { id } = await prompts({
            type: 'text',
            name: 'id',
            message: 'Venue ID (English slug):',
            initial: async () => {
                const translated = await translateToSlug(venueData.name);
                return translated || path.basename(venueData.name.toLowerCase().replace(/\s+/g, '-'));
            },
            validate: (val: string) => /^[a-z0-9-]+$/.test(val) ? true : 'ID must be alphanumeric (a-z, 0-9, -) only',
        });

        const venueSlug = id;
        const prefDir = prefectureDirMap[prefecture];

        if (!prefDir) {
            console.error(chalk.red(`Error: Could not map prefecture ${prefecture} to directory.`));
            return;
        }

        const newVenue: Venue = {
            id: venueSlug, // Store just the slug in the venue object
            name: venueData.name,
            address: venueData.address,
            lat,
            lng,
            prefecture,
        };

        // Save to venues.json (append)
        const venuesFilePath = path.join(VENUES_DIR, prefDir, 'venues.json');
        let venues: Venue[] = [];

        // Check if venues.json exists
        try {
            const existingVenues = await readJson<Venue[]>(venuesFilePath);
            if (existingVenues && Array.isArray(existingVenues)) {
                venues = existingVenues;
            }
        } catch (e) {
            // ignore, create new
        }

        // Check for duplicates in venues.json
        const existingVenueIndex = venues.findIndex(v => v.id === venueSlug);
        if (existingVenueIndex >= 0) {
            // Update existing
            venues[existingVenueIndex] = newVenue;
        } else {
            venues.push(newVenue);
        }

        await writeJson(venuesFilePath, venues);
        console.log(chalk.green(`✅ Created/Updated venue: ${newVenue.name} in ${prefDir}/venues.json`));

        venueId = `${prefDir}/${venueSlug}`;
    }

    if (!venueId) {
        console.error(chalk.red('❌ Error: Venue ID is missing. Aborting.'));
        return;
    }

    // 5. Save Event
    const newEvent: ConferenceEvent = {
        conferenceId,
        name: `${conferenceName} ${eventData.year}`, // Default name convention
        year: eventData.year,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        venueId,
        isHybrid: eventData.isHybrid,
        eventUrl: eventData.eventUrl || undefined,
    };

    const eventFilePath = path.join(EVENTS_DIR, `${eventData.year}.json`);
    let yearEvents: ConferenceEvent[] = [];

    const existingEvents = await readJson<ConferenceEvent[]>(eventFilePath);
    if (existingEvents) {
        yearEvents = existingEvents;
    }

    // Check for duplicates
    const existingIndex = yearEvents.findIndex(e => e.conferenceId === conferenceId && e.year === eventData.year);
    if (existingIndex >= 0) {
        const { overwrite } = await prompts({
            type: 'confirm',
            name: 'overwrite',
            message: 'Event already exists for this year. Overwrite?',
            initial: false,
        });
        if (!overwrite) return;
        yearEvents[existingIndex] = newEvent;
    } else {
        yearEvents.push(newEvent);
    }

    // Sort by date
    yearEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    await writeJson(eventFilePath, yearEvents);
    console.log(chalk.green(`\n🎉 Successfully saved event to data/events/${eventData.year}.json`));
}

main().catch(console.error);
