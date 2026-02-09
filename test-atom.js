
async function countAtomItems() {
    try {
        // p23 is South Korea in Google Trends legacy
        const url = 'https://trends.google.com/trends/hottrends/atom/feed?pn=p23';
        console.log(`Fetching ${url}...`);
        const response = await fetch(url);

        if (!response.ok) {
            console.log("Failed:", response.status);
            return;
        }

        const xml = await response.text();
        console.log("XML length:", xml.length);

        // Atom feeds use <entry> instead of <item>
        const matches = xml.match(/<entry>[\s\S]*?<\/entry>/g);
        console.log("Total Atom Entries:", matches ? matches.length : 0);

        if (matches && matches.length > 0) {
            console.log("First Entry:", matches[0].substring(0, 300));
        }

    } catch (e) {
        console.error(e);
    }
}
countAtomItems();
