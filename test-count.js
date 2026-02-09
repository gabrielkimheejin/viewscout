
async function countItems() {
    try {
        const response = await fetch('https://trends.google.com/trending/rss?geo=KR');
        const xml = await response.text();
        const matches = xml.match(/<item>[\s\S]*?<\/item>/g);
        console.log("Total RSS Items:", matches ? matches.length : 0);
    } catch (e) {
        console.error(e);
    }
}
countItems();
