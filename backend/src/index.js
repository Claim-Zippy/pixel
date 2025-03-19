require('dotenv').config();
console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
// Don't log the actual key for security reasons
const express = require('express');
const app = require('./app');

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 