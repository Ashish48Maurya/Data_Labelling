const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.G_API);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello, I have 2 dogs in my house." }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });
  const msg = "How many paws are in my house?";

  const result = await chat.sendMessage(msg);
  console.log(result.response.text());
}

run();
