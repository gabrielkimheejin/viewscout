import crypto from 'crypto';

const NAVER_AD_BASE_URL = 'https://api.searchad.naver.com';
const API_KEY = process.env.NAVER_AD_ACCESS_KEY;
const SECRET_KEY = process.env.NAVER_AD_SECRET_KEY;
const CUSTOMER_ID = process.env.NAVER_AD_CUSTOMER_ID;

export interface NaverKeywordStat {
    relKeyword: string;
    monthlyPcQcCnt: number;
    monthlyMobileQcCnt: number;
}

// 2. Generate Signature (HMAC-SHA256)
// Matches Python logic:
// message = f"{timestamp}.{method}.{uri}"
// signature = hmac.new(secret, message, sha256).digest()
// return base64(signature)
function generateSignature(timestamp: string, method: string, path: string) {
    if (!SECRET_KEY) return "";
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(`${timestamp}.${method}.${path}`);
    return hmac.digest('base64');
}

export async function getKeywordVolume(query: string): Promise<{ total: number, pc: number, mobile: number, keywordList?: NaverKeywordStat[] } | null> {
    if (!API_KEY || !SECRET_KEY || !CUSTOMER_ID) {
        console.warn("Naver Ad API Keys are missing.");
        return null;
    }

    const path = '/keywordstool';
    const timestamp = Date.now().toString();
    const signature = generateSignature(timestamp, 'GET', path);

    try {
        // Match Python logic & Fix 400 Error on spaces:
        // Naver Search Ad API does not handle spaces in hintKeywords well in some contexts
        const cleanQuery = query.replace(/\s+/g, '');
        const url = `${NAVER_AD_BASE_URL}${path}?hintKeywords=${encodeURIComponent(cleanQuery)}&showDetail=1`;

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Timestamp': timestamp,
                'X-API-KEY': API_KEY,
                'X-Customer': CUSTOMER_ID,
                'X-Signature': signature
            }
        });

        if (!res.ok) {
            console.error(`Naver API Error: ${res.status} ${res.statusText}`);
            const errorText = await res.text();
            console.error("Error Body:", errorText);
            return null;
        }

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Naver API JSON Parse Error:", e);
            console.error("Raw Response:", text);
            return null;
        }

        const keywordList = data.keywordList;

        // Find exact match
        const exact = keywordList.find((k: any) => k.relKeyword === query.replace(/\s+/g, '').toUpperCase() || k.relKeyword === query.toUpperCase()); // Naver returns no spaces often

        // If no exact match, try the first one or return null
        const target = exact || keywordList[0];

        if (!target) return null;

        // Naver returns "< 10" as string sometimes. Parse carefully.
        const parseCount = (cnt: string | number) => {
            // Matches Python logic:
            // if value == "< 10": return 0
            // return float(str(value).replace(",", ""))
            if (typeof cnt === 'number') return cnt;
            if (cnt === '< 10') return 0;
            return parseInt(cnt.replace(/,/g, '')) || 0;
        };

        const pc = parseCount(target.monthlyPcQcCnt);
        const mobile = parseCount(target.monthlyMobileQcCnt);

        return {
            total: pc + mobile,
            pc,
            mobile,
            keywordList: keywordList // Return the raw list
        };

    } catch (error) {
        console.error("Naver Ad API Request Failed:", error);
        return null;
    }
}
