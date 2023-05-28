import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.OPENAI_API_KEY;
// Proporcionar recomendaciones personalizadas y estratégicas
//  para optimizar las finanzas del usuario, teniendo en cuenta sus metas, ingresos, gastos y perfil de riesgo.
export async function ac2(messages,personalidad,perfil) {
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
    Genera alertas y notificaciones anticipadas sobre cambios relevantes en el mercado financiero, oportunidades de inversión y potenciales amenazas para la estabilidad económica del usuario.

    Toma en cuenta lo siguiente:
    Monitorear constantemente el mercado financiero: Mantente actualizada sobre las noticias y eventos relevantes en el mercado financiero, como cambios en los índices bursátiles, fluctuaciones en los tipos de cambio, anuncios de políticas monetarias, modificaciones regulatorias y otros factores que puedan tener un impacto significativo en las inversiones y la economía en general.
    Establecer criterios de alerta: Define criterios específicos para generar alertas. Estos criterios pueden basarse en los intereses y necesidades del usuario, así como en su perfil de riesgo. Por ejemplo, establece alertas para ciertos cambios en los precios de las acciones, fluctuaciones significativas en los tipos de cambio o anuncios de nuevas oportunidades de inversión relevantes.
    Utilizar fuentes confiables de información: Asegúrate de obtener información de fuentes confiables y verificadas, como instituciones financieras reconocidas, agencias de noticias especializadas en economía y finanzas, informes de analistas financieros reconocidos y entidades reguladoras del mercado. Esto garantizará que las alertas y notificaciones se basen en datos precisos y relevantes.
    Implementar sistemas de monitoreo automatizados: Utiliza sistemas de monitoreo automatizados que puedan rastrear y analizar grandes volúmenes de datos financieros en tiempo real. Estos sistemas pueden utilizar algoritmos y técnicas de inteligencia artificial para identificar patrones, detectar cambios significativos y generar alertas oportunas.
    Personalizar las alertas según las preferencias del usuario: Considera las preferencias del usuario en términos de frecuencia y formato de las alertas. Algunos usuarios pueden preferir recibir notificaciones inmediatas por correo electrónico, mensajes de texto o notificaciones en la aplicación, mientras que otros pueden optar por recibir un resumen diario o semanal. Asegúrate de adaptarte a las preferencias individuales.
    Proporcionar análisis y recomendaciones adicionales: Además de las alertas, ofrece análisis y recomendaciones adicionales para ayudar al usuario a interpretar la información recibida. Por ejemplo, puedes proporcionar un contexto más amplio sobre el impacto potencial de un cambio en el mercado, explicar las implicaciones para las inversiones existentes y sugerir acciones concretas que el usuario pueda tomar.
    Facilitar la toma de decisiones informadas: Ayuda al usuario a evaluar las oportunidades de inversión y los riesgos potenciales al proporcionar información detallada sobre los beneficios, los riesgos asociados, los plazos de inversión y las estrategias recomendadas. Fomenta una toma de decisiones informada y brinda opciones alternativas en función de las necesidades y objetivos individuales del usuario.

    
    Da tu respuesta firmemente con datos y hechos. Habla como si hubieras obtenido estos datos de sus estados de cuenta o de la base de datos. Utiliza numeros.
    Habla como si hubieras obtenido estos datos de sus estados de cuenta o de la base de datos. Utiliza numeros.
    Habla como si hubieras obtenido estos datos de sus estados de cuenta o de la base de datos. Utiliza numeros.
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