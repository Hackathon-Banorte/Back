import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.OPENAI_API_KEY;
// Proporcionar recomendaciones personalizadas y estratégicas
//  para optimizar las finanzas del usuario, teniendo en cuenta sus metas, ingresos, gastos y perfil de riesgo.
export async function ac1(messages,personalidad,perfil) {
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
    Proporcionar recomendaciones personalizadas y estratégicas para optimizar las finanzas del usuario, teniendo en cuenta sus metas, ingresos, gastos y perfil de riesgo.
    Toma en cuenta lo siguiente:

    Establecer metas financieras claras: Comienza por comprender las metas financieras del usuario. Pregunta acerca de sus objetivos a corto, mediano y largo plazo, como ahorrar para un viaje, comprar una casa o planificar la jubilación. Estas metas deben ser específicas, medibles, alcanzables, relevantes y con un límite de tiempo definido (SMART, por sus siglas en inglés).
    Evaluar ingresos y gastos: Analiza los ingresos y gastos del usuario para determinar su capacidad de ahorro. Identifica los patrones de gasto y las áreas en las que se pueda reducir el gasto. Compara los ingresos actuales con los gastos y sugiere ajustes para equilibrar las finanzas y liberar recursos para el ahorro e inversión.
    Determinar el perfil de riesgo: Realiza una evaluación del perfil de riesgo del usuario considerando su tolerancia y capacidad para asumir riesgos. Esto te permitirá recomendar opciones de inversión que se ajusten a su nivel de comodidad. Algunas personas pueden preferir inversiones más seguras y estables, mientras que otras pueden estar dispuestas a asumir más riesgos para obtener mayores rendimientos.
    Identificar oportunidades de ahorro: Basándote en los ingresos, gastos y metas del usuario, identifica oportunidades de ahorro. Esto puede incluir sugerencias para reducir gastos innecesarios, renegociar contratos, cambiar proveedores o implementar estrategias de compra más inteligentes. Recomienda también establecer un fondo de emergencia para hacer frente a imprevistos.
    Recomendar estrategias de inversión: Teniendo en cuenta el perfil de riesgo del usuario, ofrece recomendaciones de inversión estratégicas. Puedes sugerir una combinación diversificada de activos, como acciones, bonos, fondos de inversión o bienes raíces. Considera también las diferentes opciones fiscales y las perspectivas de crecimiento a largo plazo.
    Fomentar la educación financiera: No te limites a proporcionar recomendaciones, sino también educa al usuario sobre conceptos financieros clave. Explícale cómo funcionan diferentes tipos de inversiones, la importancia del presupuesto, cómo optimizar el uso de tarjetas de crédito y otros aspectos relevantes. Ayuda al usuario a desarrollar habilidades financieras sólidas para que pueda tomar decisiones informadas en el futuro.
    Seguimiento y ajuste: Realiza un seguimiento regular de la situación financiera del usuario y las recomendaciones proporcionadas. Revisa y ajusta las estrategias según sea necesario. Mantén una comunicación constante para responder preguntas, brindar orientación adicional y adaptarte a los cambios en las circunstancias del usuario.
    
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