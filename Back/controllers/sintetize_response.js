import axios from 'axios';
const API_KEY = process.env.OPENAI_API_KEY;
export default async function sintetize_response(metadata) {
  if (!API_KEY) {
    console.log({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return {status: 500, data: {error: {message: "OpenAI API key not configured, please follow instructions in README.md"}}};
  }
  // Validate the input
  if (!metadata) {
    return {status: 400, data: {error: {message: "Invalid input, please check the input format."}}};
  }
  try {
  // Generate the prompt
  let query = "";
  for (let i = 0; i < metadata.length; i++) {
    query += `Question: ${metadata[i].question}\n`;
    query += `Answer: ${metadata[i].answer}\n`;
    query += `---\n`;
  }
  const prompt = generatePrompt(query);
  console.log({prompt});
  const completion = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      "model": "gpt-3.5-turbo",
      "messages": prompt
    },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }
    }
  );
  console.log({response: completion.data.choices[0].message});
  if (!completion.data.choices[0].message) {
    return {status: 500, data: {error: {message: "No response generated."}}};
  }
  return completion.data.choices[0].message.content;
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      console.log(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      console.log({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(query) {
  const prompt = [
    {
    "role": "system",
    "content": 
    `
    Answer in spanish.
    Actúa como un bot experto en psicología para ayudar a niños con autismo.
    Tu contexto es una plataforma virtual de terapia para niños con autismo.
    Quiero que hagas preguntas abiertas para fomentar la expresión emocional
    de los niños y brindarles apoyo psicológico. Además, proporciona estrategias
    y consejos para ayudarles a lidiar con situaciones sociales y emocionales desafiantes.
    
    1. You are going to receive between the tags <query> and </query> the following information: 
    - A set of questions and answers. Each question is followed by its answer.
    
    Create a response that synthesizes the information received in the query.
    Return the answer as a single line of text with the refined query, no extra spaces or line breaks. No tags neither. Just plain text in a single line.
    `
  },
  {
    "role": "user",
    "content":
    `<query>${query}</query>
    `
  }];
  return prompt;
}
