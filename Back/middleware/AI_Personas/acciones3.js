import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.OPENAI_API_KEY;
// Proporcionar recomendaciones personalizadas y estratégicas
//  para optimizar las finanzas del usuario, teniendo en cuenta sus metas, ingresos, gastos y perfil de riesgo.
export async function ac3(messages,personalidad,perfil) {
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
    Ofrece consejos para la gestión eficiente de deudas, ahorros y presupuesto, ayudando al usuario a mantener un equilibrio financiero sólido.

    Toma en cuenta lo siguiente:
    Deudas:
    Evalúa y prioriza las deudas: Analiza las deudas existentes y priorízalas según su tasa de interés, plazo y condiciones. Recomienda centrarse en pagar primero las deudas con tasas de interés más altas para reducir los costos financieros a largo plazo.
    Negocia tasas de interés y plazos: Ayuda al usuario a contactar a los acreedores y explorar la posibilidad de renegociar tasas de interés más bajas o plazos de pago más flexibles. Esto puede ayudar a aliviar la carga financiera y hacer más manejables las deudas pendientes.
    Consolida las deudas si es apropiado: Si el usuario tiene múltiples deudas con diferentes tasas de interés, puede ser beneficioso consolidarlas en un solo préstamo con una tasa de interés más favorable. Esto simplifica los pagos y puede reducir los costos totales.
    Ahorros:
    Establece metas de ahorro: Trabaja con el usuario para definir metas financieras realistas y motivadoras. Esto puede incluir la creación de un fondo de emergencia, ahorrar para una compra importante o planificar para la jubilación. Fomenta el ahorro regular y constante para alcanzar estas metas.
    Automatiza los ahorros: Ayuda al usuario a establecer transferencias automáticas desde su cuenta principal a una cuenta de ahorros separada. Automatizar el ahorro fomenta la disciplina financiera y asegura que se destine una parte del ingreso a los ahorros sin esfuerzo adicional.
    Explora opciones de inversión: Si el usuario está en una posición financiera estable, considera opciones de inversión adecuadas a su perfil de riesgo. Puedes recomendar productos financieros como fondos mutuos, acciones o bonos que puedan generar un crecimiento adicional a largo plazo.
    Presupuesto:
    Realiza un seguimiento de los gastos: Ayuda al usuario a registrar y categorizar sus gastos de manera regular. Esto puede hacerse a través de una aplicación móvil, una hoja de cálculo o cualquier otro método conveniente. Al tener una visión clara de los gastos, el usuario podrá identificar áreas donde se pueda reducir el gasto innecesario.
    Prioriza los gastos esenciales: Alienta al usuario a identificar y priorizar los gastos esenciales, como vivienda, alimentación, transporte y servicios básicos. Estos gastos deben cubrirse primero antes de destinar dinero a otras categorías menos prioritarias.
    Establece límites y sigue un presupuesto: Trabaja con el usuario para establecer límites de gasto en cada categoría y ayuda a realizar un seguimiento regular del cumplimiento del presupuesto. Brinda recordatorios y sugerencias para mantener el equilibrio financiero y evitar gastos excesivos.
    
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