require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html)
app.use(express.static('./'));

// Initialize Gemini client with API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ API Key missing in environment variables!");
} else {
  console.log("✅ API Key successfully loaded");
}

// Chat API endpoint
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
    });

    // Safely retrieve generated response text
    const replyText = response.text || (response.candidates && response.candidates[0]?.content?.parts[0]?.text);

    if (replyText) {
      res.json({ reply: replyText });
    } else {
      res.json({ reply: "I received your message, but could not format a text response." });
    }
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
