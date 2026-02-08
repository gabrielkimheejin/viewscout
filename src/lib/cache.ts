
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'keyword-data.json');
const TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

interface CacheEntry {
    timestamp: number;
    data: any;
}

interface CacheStore {
    [keyword: string]: CacheEntry;
}

// Ensure cache directory exists
function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
}

// Load cache from disk
function loadCache(): CacheStore {
    try {
        ensureCacheDir();
        if (!fs.existsSync(CACHE_FILE)) {
            return {};
        }
        const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.warn("Failed to load cache:", e);
        return {};
    }
}

// Save cache to disk
function saveCache(store: CacheStore) {
    try {
        ensureCacheDir();
        fs.writeFileSync(CACHE_FILE, JSON.stringify(store, null, 2));
    } catch (e) {
        console.warn("Failed to save cache:", e);
    }
}

export async function getCachedData(keyword: string): Promise<any | null> {
    const store = loadCache();
    const entry = store[keyword];

    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > TTL_MS) {
        // Expired
        return null;
    }

    // console.log(`[Cache] HIT for ${keyword}`);
    return entry.data;
}

export async function setCachedData(keyword: string, data: any) {
    const store = loadCache();
    store[keyword] = {
        timestamp: Date.now(),
        data
    };
    saveCache(store);
    // console.log(`[Cache] SAVED for ${keyword}`);
}
