import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/analyze", async (req, res) => {
    try {
        const { input,image } = req.body;

        if (!input || !input.trim()) {
            return res.status(400).json({
                error: "Input is required"
            });
        }

        const prompt = `
You are NEXUS, a Universal Action Bridge.

Convert the user's messy real-world report into structured information.

Rules:
- Do not invent facts.
- Use "Unknown" when information is missing.
- Clearly separate known information from assumptions.
- Give a practical recommended action.
- This is a civic/road-safety demonstration.

Return ONLY valid JSON.

Required fields:
category
issue
urgency
location
affectedUsers
evidence
missingInformation
recommendedAction
confidence
verificationNotes

User report:
${input}
`;

        const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: image
        ? [
            { text: prompt },
            {
                inlineData: {
                    mimeType: image.mimeType,
                    data: image.data
                }
            }
        ]
        : prompt,
    config: {
        responseMimeType: "application/json"
    }
});

        const result = JSON.parse(response.text);

        res.json(result);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Gemini request failed"
        });
    }
});

app.listen(3000, () => {
    console.log("NEXUS backend running at http://localhost:3000");
});
