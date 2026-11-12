import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const modelsToTest = [
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-2.0-flash"
];

const run = async () => {
  const apiKey = process.env.GOOGLE_API_KEY || "";
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent("test");
      console.log(`Success with: ${modelName}`);
      return; // Exit on first success
    } catch (error: any) {
      console.log(`Failed with ${modelName}:`, error.message || error);
    }
  }
};

run();
