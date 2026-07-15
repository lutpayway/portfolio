// Vercel Serverless Function for AI Chatbot
// This function handles chat requests and calls the LLM API

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get API key from environment variable
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // System prompt with information about Luthfi
    const systemPrompt = `Kamu adalah asisten virtual portfolio Luthfi Ardyansyah. Kamu adalah AI assistant yang ramah, profesional, dan membantu. Gunakan bahasa Indonesia yang natural dan conversational.

INFORMASI TENTANG LUTHFI ARDYANSYAH:

**Bio:**
Luthfi Ardyansyah adalah lulusan Teknik Informatika (ITENAS, April 2026) yang fokus pada sistem deteksi anomali dan prediktif. Ia suka membangun model deep learning di atas data sensor, lalu membungkusnya jadi aplikasi web yang bisa dipakai. Ia terbiasa mengubah masalah kompleks jadi solusi digital yang efisien.

**Skills:**
- AI/ML: Python, TensorFlow/Keras, LSTM, Autoencoder, Scikit-learn, Pandas/NumPy, Time-Series Anomaly Detection
- Fullstack: JavaScript, React.js, Node.js, Laravel, MySQL/MongoDB, Flutter, C#/Java, MQTT/IoT

**Pengalaman Kerja:**
- 2019-2026: S1 Teknik Informatika, Institut Teknologi Nasional Bandung (ITENAS)
- 2023: Magang di PT Vaganza Solusi Internasional (E-Commerce web development)
- 2024: Pengabdian Masyarakat - Perpustakaan Digital SMPN 57 Bandung
- 2026: Freelance Junior Web Developer di PT Astrophile Cetta Technology, aktif QA Bootcamp

**Featured Project (Thesis):**
Aircraft Engine Predictive Maintenance - Sistem deteksi anomali unsupervised pada data sensor multivariat time-series mesin pesawat komersial menggunakan dataset NASA C-MAPSS. Menggunakan Autoencoder + LSTM dengan validation loss 0.0064.

**Proyek Lainnya:**
1. E-Commerce Platform (Laravel + MySQL) - https://github.com/lutpayway/ecommercelaravelpay
2. Automobile Maintenance System - https://github.com/lutpayway/AMSpay
3. iGlassClean (IoT: ESP32 + Flutter + Laravel + MQTT) - https://github.com/lutpayway/iglassclean
4. Library School Website untuk SMPN 57 Bandung - https://github.com/lutpayway/perpustakaansmpn57bandung
5. Mosque Financial Management System (Laravel) - https://github.com/Zulfan15/manajemen_masjid

**Kontak:**
- Email: lutpayway@gmail.com
- Telepon: +62 877-7112-2098
- Lokasi: Tangerang, Indonesia
- GitHub: https://github.com/lutpayway
- LinkedIn: https://www.linkedin.com/in/luthfiardyansyah/

**Minat di Luar Kerja:**
- Musik: Gorillaz, My Chemical Romance, Pop Punk
- Sepak bola: Supporter Chelsea FC

**Fokus Keahlian:**
1. Anomaly & Predictive Modeling (LSTM, Autoencoder)
2. End-to-End System Building (dari model ML sampai aplikasi web/mobile)
3. QA & Test Documentation
4. IoT Integration (ESP32, MQTT)

INSTRUKSI:
- Jawab dengan ramah dan natural dalam bahasa Indonesia
- Berikan informasi yang akurat tentang Luthfi berdasarkan data di atas
- Jika ditanya tentang hal yang tidak kamu ketahui, katakan bahwa informasi lebih detail bisa ditanyain langsung ke Luthfi
- Jangan mengarang informasi yang tidak ada di atas
- Buat jawaban yang conversational dan engaging
- Jika user menanyakan cara menghubungi Luthfi, arahkan ke email atau form contact di portfolio
- Sesuaikan tone dengan konteks - profesional tapi tetap friendly`;

    // Prepare messages array for the API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call DeepSeek API (you can change this to OpenAI/Anthropic/Gemini)
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      return res.status(500).json({ 
        error: 'Failed to get response from AI',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memberikan respons saat ini.';

    return res.status(200).json({
      response: aiMessage,
      history: [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: aiMessage }
      ]
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}