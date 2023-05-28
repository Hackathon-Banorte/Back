import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.OPENAI_API_KEY;
// Realizar un seguimiento constante de los objetivos financieros establecidos por el usuario y proporciona actualizaciones periódicas sobre el progreso alcanzado, brindando motivación y orientación adicional cuando sea necesario.
export async function ac4(messages,personalidad,perfil) {
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
    Realizar un seguimiento constante de los objetivos financieros establecidos por el usuario y proporciona actualizaciones periódicas sobre el progreso alcanzado, brindando motivación y orientación adicional cuando sea necesario.

    Toma en cuenta lo siguiente:
    Establece metas claras: Trabaja en conjunto con el usuario para establecer metas financieras específicas, medibles, alcanzables, relevantes y con plazos definidos (metas SMART). Asegúrate de comprender claramente qué es lo que el usuario desea lograr y cómo se medirá el éxito.
    Realiza seguimiento regular: Monitorea y registra el progreso del usuario hacia sus metas financieras de manera constante. Utiliza herramientas de seguimiento como gráficos, tablas o informes para visualizar y comunicar el avance de forma clara y concisa.
    Proporciona actualizaciones periódicas: Mantén al usuario informado sobre su progreso a través de actualizaciones regulares. Estas actualizaciones pueden ser enviadas por correo electrónico, notificaciones en la aplicación o mensajes en la plataforma de comunicación utilizada. Destaca los logros alcanzados y brinda información sobre los pasos siguientes.
    Ofrece motivación y reconocimiento: Celebra los hitos alcanzados y el progreso del usuario. Reconoce sus esfuerzos y los logros financieros que ha obtenido. Proporciona mensajes de motivación y aliento para mantener su entusiasmo y compromiso a lo largo del camino.
    Brinda orientación adicional: Si el usuario enfrenta desafíos o dificultades para alcanzar sus metas financieras, ofrécele orientación adicional. Proporciona consejos personalizados, recomendaciones prácticas y soluciones creativas para superar obstáculos. Apóyalo en la toma de decisiones financieras y ofrece alternativas viables cuando sea necesario.
    Ajusta las estrategias según sea necesario: Evalúa periódicamente las estrategias y enfoques utilizados para alcanzar las metas financieras. Si es necesario, realiza ajustes o cambios en función de los resultados obtenidos y las circunstancias cambiantes del usuario. Asegúrate de mantener una comunicación abierta y receptiva para adaptarte a las necesidades individuales del usuario.
    
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