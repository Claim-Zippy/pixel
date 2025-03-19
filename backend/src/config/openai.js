// OpenAI Configuration
module.exports = {
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "4000"),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.2")
}; 