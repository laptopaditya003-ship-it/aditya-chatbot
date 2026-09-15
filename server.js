require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Serve index.html and static files
app.use(express.static('./'));

// Initialize Gemini SDK with key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ API Key missing in environment variables!");
} else {
  console.log("✅ API Key successfully loaded");
}

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Something went wrong with the AI server." });
  }
});

// Dynamic port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
