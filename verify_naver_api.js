const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

// 1. Read .env.local manually
const env = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => {
    const match = env.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : '';
};

const ACCESS_KEY = getEnv('NAVER_AD_ACCESS_KEY');
const SECRET_KEY = getEnv('NAVER_AD_SECRET_KEY');
const CUSTOMER_ID = getEnv('NAVER_AD_CUSTOMER_ID');

if (!ACCESS_KEY || !SECRET_KEY) {
    console.error("❌ Keys not found in .env.local");
    process.exit(1);
}

// 2. Signature Logic (Matches Python logic: hmac + sha256 + base64)
function generateSignature(timestamp, method, path) {
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(`${timestamp}.${method}.${path}`);
    return hmac.digest('base64');
}

// 3. Request
const BASE_URL = 'https://api.searchad.naver.com';
const PATH = '/keywordstool';
const QUERY = '아이폰'; // Test Keyword

const timestamp = Date.now().toString();
const signature = generateSignature(timestamp, 'GET', PATH);

const url = `${BASE_URL}${PATH}?hintKeywords=${encodeURIComponent(QUERY)}&showDetail=1`;

console.log(`Testing Naver Ad API...`);
console.log(`Target: ${url}`);

const options = {
    method: 'GET',
    headers: {
        'X-Timestamp': timestamp,
        'X-API-KEY': ACCESS_KEY,
        'X-Customer': CUSTOMER_ID,
        'X-Signature': signature
    }
};

const req = https.request(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => { data += chunk; });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log("✅ Naver API Connection Successful!");
            const json = JSON.parse(data);
            const item = json.keywordList[0];
            console.log(`Keyword: ${item.relKeyword}`);
            console.log(`PC Queries: ${item.monthlyPcQcCnt}`);
            console.log(`Mobile Queries: ${item.monthlyMobileQcCnt}`);
        } else {
            console.error(`❌ Request Failed: ${res.statusCode}`);
            console.error(data);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Error: ${e.message}`);
});

req.end();
