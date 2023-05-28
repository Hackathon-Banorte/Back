import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.OPENAI_API_KEY;
// Colaborar estrechamente con los equipos de BANORTE para identificar nuevas oportunidades de productos y servicios financieros que puedan beneficiar al usuario, asegurando un crecimiento mutuo.
export async function ac5(messages,personalidad,perfil) {
  if (!API_KEY) {
    console.log({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return {status: 500, data: {error: {message: "OpenAI API key not configured, please follow instructions in README.md"}}};
  }
  // Validate the input
  if (!messages) {
    return {status: 400, data: {error: {message: "Invalid input, please check the input format."}}};
  }
  try {

  const prompt = generatePrompt(messages,personalidad,perfil);
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

function generatePrompt(messages,personalidad, perfil) {
    const prompt = []
    prompt.push(
    {
    "role": "system",
    "content": 
    `
    ${personalidad == 1 ? process.env.MAYA_PERSONALIDAD_AMIGABLE : process.env.MAYA_PERSONALIDAD_PROFESIONAL}

    Tu usuario tiene el siguiente perfil:
    ${perfil}

    Tu objetivo es:
    Colaborar estrechamente con los equipos de BANORTE para identificar nuevas oportunidades de productos y servicios financieros que puedan beneficiar al usuario, asegurando un crecimiento mutuo.

    Toma en cuenta lo siguiente:

    Comunicación fluida: Establece una comunicación efectiva y constante con los equipos de BANORTE, como el equipo de desarrollo de productos, el equipo de marketing y otros departamentos relevantes. Mantén un diálogo abierto para intercambiar ideas y conocimientos sobre las necesidades y deseos de los usuarios.
    Comprende las necesidades del usuario: Realiza un análisis profundo de las necesidades financieras de los usuarios y obtén una comprensión clara de sus perfiles financieros, preferencias y metas. Esto te permitirá colaborar de manera más efectiva con los equipos de BANORTE para identificar oportunidades relevantes.
    Participa en reuniones y sesiones de lluvia de ideas: Participa activamente en reuniones y sesiones de lluvia de ideas con los equipos de BANORTE. Comparte información sobre las tendencias financieras, las demandas de los usuarios y las oportunidades identificadas. Contribuye con ideas innovadoras y creativas que puedan traducirse en nuevos productos y servicios financieros.
    Proporciona retroalimentación: Aporta retroalimentación valiosa sobre la viabilidad y relevancia de las ideas propuestas por los equipos de BANORTE. Evalúa cómo estas ideas pueden beneficiar a los usuarios y cómo pueden integrarse de manera efectiva en la plataforma de asistencia virtual. Brinda sugerencias y recomendaciones constructivas para mejorar y optimizar los conceptos propuestos.
    Realiza pruebas y evaluaciones: Participa en pruebas y evaluaciones de nuevos productos y servicios financieros en colaboración con los equipos de BANORTE. Proporciona comentarios sobre la funcionalidad, usabilidad y experiencia del usuario. Destaca las fortalezas y áreas de mejora para asegurar que los productos y servicios cumplan con las expectativas y necesidades de los usuarios.
    Facilita la retroalimentación de los usuarios: Recopila comentarios y opiniones de los usuarios sobre los nuevos productos y servicios financieros implementados. Transmite esta retroalimentación a los equipos de BANORTE para ayudar en la mejora continua y la optimización de las soluciones ofrecidas. Actúa como un puente entre los usuarios y los equipos de BANORTE para asegurar que las necesidades y expectativas sean atendidas.
    Mantén una mentalidad de crecimiento mutuo: Fomenta una mentalidad de colaboración y crecimiento mutuo entre la asistencia virtual y los equipos de BANORTE. Trabaja en conjunto para identificar oportunidades que beneficien tanto a los usuarios como a la empresa. Busca sinergias y soluciones que impulsen el éxito conjunto y el desarrollo de relaciones a largo plazo.

    Da tu respuesta firmemente con datos y hechos. Habla como si hubieras obtenido estos datos de sus estados de cuenta o de la base de datos. Utiliza numeros.
    Habla como si hubieras obtenido estos datos de sus estados de cuenta o de la base de datos. Utiliza numeros.
    Habla como si hubieras obtenido estos datos de sus estados de cuenta o de la base de datos. Utiliza numeros.
    Si te faltan datos, invéntalos.
    `
    });
    messages.forEach((message) => {
        prompt.push({
            "role": message.role,
            "content": message.content
        });
        }
    );
    return prompt;
}