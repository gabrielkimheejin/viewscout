const XLSX = require('xlsx');
const path = "/Users/gabykim/Library/CloudStorage/GoogleDrive-kimhj11200@gmail.com/내 드라이브/antigravity/Viewscout/키워드분석 계산식.xlsx";

try {
    const workbook = XLSX.readFile(path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Get JSON data
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays
    console.log("Excel Content:", JSON.stringify(data, null, 2));
} catch (e) {
    console.error("Error reading file:", e);
}
