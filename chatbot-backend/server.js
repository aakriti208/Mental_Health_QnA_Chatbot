const express = require('express');
const cors = require('cors');
const natural = require('natural');
const fs = require('fs');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

let data;
try {
  data = JSON.parse(fs.readFileSync('chatbot_data_FAQ.json', 'utf8'));
  console.log("Raw data sample:", JSON.stringify(data.slice(0, 2)));
} catch (error) {
  console.error("Failed to load JSON:", error);
  process.exit(1);
}

const questions = data.map(item => item.Questions || '');
const answers = data.map(item => item.Answers || 'No answer available');

console.log("Loaded questions:", questions.slice(0, 5));
console.log("Loaded answers:", answers.slice(0, 5));

if (questions.length === 0 || answers.length === 0) {
  console.error("No valid questions or answers found in dataset");
  process.exit(1);
}

const tfidf = new natural.TfIdf();
questions.forEach((question) => tfidf.addDocument(question || ''));

const veteranResources = "For more support, contact the VA Crisis Line at 1-800-273-8255.";
const disclaimer = "I’m here to provide info, not replace professional help. In a crisis, call 911.";

app.post('/chat', (req, res) => {
  const userQuery = req.body.query ? req.body.query.toLowerCase() : '';

  let similarities = [];
  tfidf.tfidfs(userQuery, (i, measure) => similarities[i] = measure);
  const bestMatchIndex = similarities.indexOf(Math.max(...similarities));

  let response;
  if (bestMatchIndex >= answers.length || bestMatchIndex < 0 || similarities[bestMatchIndex] === 0) {
    response = "Sorry, I don’t have an answer for that right now.";
  } else {
    response = answers[bestMatchIndex];
  }

  if (["deployment", "combat", "ptsd", "veteran"].some(keyword => userQuery.includes(keyword))) {
    response += `\n${veteranResources}`;
  }

  res.json({ response: `${disclaimer}\n${response}` });
});

app.listen(port, () => console.log(`Server on http://localhost:${port}`));