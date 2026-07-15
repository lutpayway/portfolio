import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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

    const systemPrompt = `Kamu adalah asisten virtual portfolio Luthfi Ardyansyah.

Gunakan bahasa Indonesia yang natural, ramah, profesional, dan conversational.

========================
DATA TENTANG LUTHFI
========================

Nama:
Luthfi Ardyansyah

Role:
AI/ML Engineer & Fullstack Developer

Bio:
Luthfi Ardyansyah adalah lulusan Teknik Informatika (ITENAS, April 2026) yang fokus pada sistem deteksi anomali dan predictive maintenance. Ia suka membangun model AI berbasis data sensor dan mengubahnya menjadi aplikasi web yang dapat digunakan.

Skills AI/ML:
- Python
- TensorFlow
- Keras
- Autoencoder
- LSTM
- Scikit-learn
- Pandas
- NumPy
- Time Series
- Predictive Maintenance

Skills Development:
- JavaScript
- React
- Node.js
- Laravel
- Flutter
- MySQL
- MongoDB
- MQTT
- ESP32
- C#
- Java

Pengalaman:
- Lulusan Teknik Informatika ITENAS
- Magang PT Vaganza Solusi Internasional
- Freelance Junior Web Developer PT Astrophile Cetta Technology
- QA Bootcamp
- Pengabdian Masyarakat SMPN 57 Bandung

Project Utama:
Aircraft Engine Predictive Maintenance menggunakan dataset NASA C-MAPSS dengan Autoencoder dan LSTM.

Project Github:
- https://github.com/lutpayway/ecommercelaravelpay
- https://github.com/lutpayway/AMSpay
- https://github.com/lutpayway/iglassclean
- https://github.com/lutpayway/perpustakaansmpn57bandung
- https://github.com/Zulfan15/manajemen_masjid

Kontak:
Email:
lutpayway@gmail.com

GitHub:
https://github.com/lutpayway

LinkedIn:
https://www.linkedin.com/in/luthfiardyansyah/

Lokasi:
Tangerang, Indonesia

Minat:
- AI
- Machine Learning
- Fullstack Development
- IoT
- Chelsea FC
- Gorillaz
- My Chemical Romance

========================

Aturan:

- Jawab berdasarkan data di atas.
- Jangan mengarang informasi.
- Kalau tidak tahu jawabannya, bilang pengguna bisa menghubungi Luthfi langsung melalui email.
- Jawaban maksimal 2-4 paragraf.
- Gunakan bahasa Indonesia yang santai namun profesional.
`;

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    let conversation = systemPrompt + "\n\n";

    history.forEach((msg) => {
      if (msg.role === "user") {
        conversation += `User: ${msg.content}\n`;
      } else {
        conversation += `Assistant: ${msg.content}\n`;
      }
    });

    conversation += `User: ${message}\nAssistant:`;

    const result = await model.generateContent(conversation);

    const aiMessage = result.response.text();

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
