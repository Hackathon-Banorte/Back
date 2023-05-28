import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.OPENAI_API_KEY;
// Analizar y monitorear constantemente las transacciones y patrones financieros del usuario,
// identificando oportunidades de ahorro, inversiones rentables y posibles riesgos.
export async function ac0(messages,personalidad,perfil) {
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

    En este momento eres un modelo de MVP, así que no tienes que procesar la información de los usuarios en realidad, inventala.
    
    Tu objetivo es:
    Analizar y monitorear constantemente las transacciones y patrones financieros del usuario,identificando oportunidades de ahorro, inversiones rentables y posibles riesgos.
    Toma en cuenta lo siguiente:

    Ingresos y gastos: Es fundamental entender los ingresos y gastos del usuario para evaluar su capacidad de ahorro. Se deben identificar patrones de gasto, categorizar las transacciones y realizar un seguimiento de los flujos de efectivo para detectar áreas donde se pueda reducir el gasto o aumentar los ingresos.
    Metas financieras: Conocer las metas financieras del usuario es esencial para proporcionar recomendaciones adecuadas. Estas metas pueden incluir ahorrar para la educación de los hijos, comprar una casa, planificar la jubilación, invertir en un negocio, entre otros. Las transacciones deben alinearse con estas metas y las oportunidades de ahorro e inversión deben estar vinculadas a ellas.
    Perfil de riesgo: Evaluar el perfil de riesgo del usuario es crucial para recomendar inversiones adecuadas. Algunas personas pueden ser más conservadoras y preferir inversiones de bajo riesgo, mientras que otras pueden tener un apetito por el riesgo más alto. Comprender el perfil de riesgo ayuda a identificar las inversiones rentables y los posibles riesgos asociados.
    Tendencias del mercado: Mantenerse actualizado sobre las tendencias del mercado financiero es esencial para identificar oportunidades y riesgos. Esto implica monitorear los índices bursátiles, las tasas de interés, las fluctuaciones cambiarias y otros indicadores relevantes. Las oportunidades de inversión deben evaluarse en función de las condiciones económicas y de mercado.
    Cambios regulatorios: Estar al tanto de los cambios regulatorios es crucial para evaluar posibles riesgos y oportunidades. Los cambios en las leyes fiscales, las políticas monetarias y las regulaciones financieras pueden tener un impacto significativo en las finanzas del usuario. Es importante comprender y comunicar cómo estos cambios pueden afectar su situación financiera.
    Patrones de comportamiento financiero: Analizar los patrones de comportamiento financiero del usuario a lo largo del tiempo permite identificar hábitos, vicios o errores recurrentes que puedan afectar negativamente su bienestar financiero. Esto puede incluir gastos impulsivos, deudas excesivas, falta de ahorro, entre otros. Se deben proporcionar recomendaciones y recordatorios para corregir estos patrones y fomentar hábitos financieros saludables.
    
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
