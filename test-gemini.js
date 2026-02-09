
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    const apiKey = "AIzaSyCbbxIS1Cb60v9mrCaLaGEBRaO2dW5Xo54"; // Hardcoded for test
    console.log("Testing API Key with gemini-3-flash-preview...");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    try {
        const prompt = "답변: 'Gemini 3.0 Works!'";
        console.log("Sending prompt...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (error) {
        console.error("Error:", error);
    }
}

testGemini();
