const http = require("http");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const PORT = 3000;
const API_KEY = process.env.GEMINI_API_KEY;

const ai = API_KEY
  ? new GoogleGenAI({ apiKey: API_KEY })
  : null;

const server = http.createServer(async (req, res) => {

  if (req.method === "GET" && req.url === "/") {

    const file = fs.readFileSync(
      path.join(__dirname, "index.html")
    );

    res.writeHead(200, {
      "Content-Type": "text/html"
    });

    res.end(file);
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {

      try {

        const data = JSON.parse(body);
        const question = data.question;

        if (!ai) {
          res.writeHead(500, {
            "Content-Type": "application/json"
          });

          res.end(JSON.stringify({
            answer: "❌ Gemi API key is not connected."
          }));

          return;
        }

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: question,
          config: {
            systemInstruction:
              "You are Aditya AI, a helpful AI assistant. Answer questions clearly, accurately and helpfully."
          }
        });

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          answer: response.text
        }));

      } catch (error) {

        console.log("Gemini error:", error);

        res.writeHead(500, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          answer: "❌ Gemini could not answer. Check your API key and free-tier availability."
        }));
      }

    });

    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("");
  console.log("🤖 Aditya AI is running!");
  console.log("🌐 Open: http://localhost:" + PORT);
  console.log("");
});