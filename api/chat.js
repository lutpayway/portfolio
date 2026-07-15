import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY not found",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const systemPrompt = `
Kamu adalah AI Assistant portfolio milik Luthfi Ardyansyah.

Jawab menggunakan bahasa Indonesia yang natural, profesional, dan ramah.

Informasi tentang Luthfi:

Nama:
Luthfi Ardyansyah

Role:
AI/ML Engineer & Fullstack Developer

Bio:
Lulusan Teknik Informatika ITENAS yang fokus pada AI, Machine Learning, Predictive Maintenance, Fullstack Development, dan IoT.

Skills AI:
- Python
- TensorFlow
- Keras
- Autoencoder
- LSTM
- Scikit-learn
- Pandas
- NumPy

Skills Development:
- Laravel
- React
- Node.js
- Flutter
- MySQL
- MongoDB
- MQTT
- ESP32

Pengalaman:
- PT Vaganza Solusi Internasional
- PT Astrophile Cetta Technology
- QA Bootcamp
- SMPN 57 Bandung

Project:
- Aircraft Engine Predictive Maintenance
- E-Commerce Laravel
- Automobile Maintenance System
- iGlassClean
- Library School Website

GitHub:
https://github.com/lutpayway

LinkedIn:
https://linkedin.com/in/luthfiardyansyah

Email:
lutpayway@gmail.com

Rules:
- Jawab hanya berdasarkan informasi di atas.
- Jangan mengarang.
- Jika informasi tidak ada, sarankan menghubungi Luthfi melalui email.
- Maksimal 3 paragraf.
`;

    let conversation = "";

    for (const msg of history) {
      conversation += `${msg.role === "assistant" ? "Assistant" : "User"}: ${msg.content}\n`;
    }

    conversation += `User: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: conversation,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const aiMessage = response.text;

    return res.status(200).json({
      response: aiMessage,
      history: [
        ...history,
        {
          role: "user",
          content: message,
        },
        {
          role: "assistant",
          content: aiMessage,
        },
      ],
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
}
