require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');

// Load environment variables
const token = process.env.TELEGRAM_TOKEN;
const webhookURL = process.env.WEBHOOK_URL;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Init Express
const app = express();
app.use(express.json());

// Init Telegram bot (NO polling)
const bot = new TelegramBot(token);
bot.setWebHook(`${webhookURL}/bot${token}`);

console.log("🚀 Webhook set at:", `${webhookURL}/bot${token}`);

// ✅ Message Handler
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  console.log("📩 Received message:", userMessage);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Manas+, a friendly mental and physical well-being assistant. Respond kindly and only in English."
        },
        { role: "user", content: userMessage }
      ]
    });

    const reply = response.choices[0].message.content;
    console.log("🤖 Replying with:", reply);
    await bot.sendMessage(chatId, reply);

  } catch (err) {
    console.error("❌ Full OpenAI Error:", err.response?.data || err.message || err);
    await bot.sendMessage(chatId, "⚠️ Sorry, I'm having trouble responding.");
  }
});

// ✅ Telegram will POST updates here
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Manas+ is live at http://localhost:${PORT}`);
});
