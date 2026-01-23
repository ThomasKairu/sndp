import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROPERTIES, COMPANY_INFO } from '../constants';

// --- Configuration ---

const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    return apiKey.trim();
  }
  return "";
};

const API_KEY = getApiKey();
let genAI: GoogleGenerativeAI | null = null;

// Initialize the Gemini client
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

// --- Build Context for AI ---

const buildSystemPrompt = (): string => {
  const propertiesContext = PROPERTIES.map(p =>
    `- ${p.title} at ${p.location} (${p.size}): KES ${p.price.toLocaleString()}. ${p.description} (Status: ${p.status})`
  ).join('\n');

  return `You are the dedicated, professional sales representative for 'Provision Land Limited' in Kenya.

YOUR MISSION:
1. Answer the user's question directly and accurately based on the property listings provided.
2. Gently lead them towards booking a site visit.
3. Keep responses concise (under 3-4 sentences) unless detailed info is requested.
4. If the user shares their phone number, thank them and confirm the sales team will call.
5. Be friendly, helpful, and professional. Use occasional Swahili greetings like "Jambo" or "Karibu".

COMPANY DETAILS:
- Name: ${COMPANY_INFO.name}
- Location: ${COMPANY_INFO.address}
- Phone: ${COMPANY_INFO.phone}

CURRENT LISTINGS:
${propertiesContext}

Remember: You are a helpful sales assistant. Always be positive about the properties and guide customers toward making a purchase decision.`;
};

// --- Tools Definition for Gemini ---

const tools = [
  {
    functionDeclarations: [
      {
        name: "notifySalesTeam",
        description: "Send customer contact details and inquiry summary to the Provision Land sales team. Call this IMMEDIATELY when the user provides a phone number.",
        parameters: {
          type: "OBJECT",
          properties: {
            phoneNumber: { type: "STRING", description: "The customer's phone number." },
            customerName: { type: "STRING", description: "The customer's name, if provided." },
            inquirySummary: { type: "STRING", description: "A comprehensive summary of what the customer is interested in." },
          },
          required: ["phoneNumber", "inquirySummary"],
        },
      },
    ],
  },
];

// --- Pollinations.AI Fallback (FREE, No API Key Required) ---

const getPollinationsResponse = async (
  message: string,
  history: { role: 'user' | 'model', text: string }[]
): Promise<string> => {
  console.log("Using Pollinations.AI fallback...");

  const systemPrompt = buildSystemPrompt();

  // Build conversation history for context (last 6 messages)
  const conversationHistory = history
    .slice(-6)
    .map(h => `${h.role === 'user' ? 'Customer' : 'Assistant'}: ${h.text}`)
    .join('\n');

  const fullPrompt = `${systemPrompt}

CONVERSATION SO FAR:
${conversationHistory}

Customer: ${message}

Please respond as the Provision Land sales assistant. Keep your response concise and helpful.`;

  try {
    // Use Pollinations.AI POST endpoint for text generation
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.text
          })),
          { role: 'user', content: message }
        ],
        model: 'openai', // Uses GPT model via Pollinations
        seed: Math.floor(Math.random() * 1000000),
        jsonMode: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`);
    }

    const text = await response.text();
    console.log("Pollinations.AI response received successfully");
    return text;
  } catch (error) {
    console.error("Pollinations.AI Error:", error);
    throw error;
  }
};

// --- Gemini API Call ---

const getGeminiResponse = async (
  message: string,
  history: { role: 'user' | 'model', text: string }[],
  onLeadDetected?: (details: { phoneNumber: string, customerName?: string, inquirySummary: string }) => void
): Promise<string> => {
  if (!genAI) {
    throw new Error("Gemini not initialized");
  }

  const systemInstruction = buildSystemPrompt();

  // Select Model - Using 'gemini-2.5-pro' for advanced reasoning
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    systemInstruction: systemInstruction,
    tools: tools as any,
  });

  // Convert History to SDK Format
  let chatHistory = history.map(h => ({
    role: h.role === 'model' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));

  // Fix: SDK requires history to start with 'user'. Remove leading 'model' messages.
  if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
    chatHistory = chatHistory.slice(1);
  }

  // Start Chat Session
  const chat = model.startChat({
    history: chatHistory,
  });

  // Send Message
  console.log("Sending message to Gemini 2.5 Pro...");
  const result = await chat.sendMessage(message);
  const response = await result.response;

  // Handle Function Calls (Tools)
  const functionCalls = response.functionCalls();

  if (functionCalls && functionCalls.length > 0) {
    for (const call of functionCalls) {
      if (call.name === 'notifySalesTeam') {
        console.log("Tool Called: notifySalesTeam", call.args);
        const args = call.args as any;

        // Trigger the callback to the UI (Contact Sales)
        if (onLeadDetected) {
          onLeadDetected({
            phoneNumber: args.phoneNumber,
            customerName: args.customerName,
            inquirySummary: args.inquirySummary
          });
        }

        // Send success response back to the model
        const functionResponse = [
          {
            functionResponse: {
              name: 'notifySalesTeam',
              response: { result: "Success: Sales team notified." }
            }
          }
        ];

        const finalResult = await chat.sendMessage(functionResponse);
        return finalResult.response.text();
      }
    }
  }

  return response.text();
};

// --- Main Service Function with Fallback ---

export const getChatResponse = async (
  message: string,
  history: { role: 'user' | 'model', text: string }[],
  onLeadDetected?: (details: { phoneNumber: string, customerName?: string, inquirySummary: string }) => void
): Promise<string> => {

  // Try Gemini first if available
  if (genAI) {
    try {
      return await getGeminiResponse(message, history, onLeadDetected);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      console.error("Error Message:", error?.message);
      console.error("Error Status:", error?.status);

      // Check if it's a quota error (429) - fallback to Pollinations
      const isQuotaError = error?.status === 429 ||
        (error?.message && error.message.includes("429")) ||
        (error?.message && error.message.toLowerCase().includes("quota"));

      if (isQuotaError) {
        console.log("Gemini quota exceeded, switching to Pollinations.AI fallback...");
        try {
          return await getPollinationsResponse(message, history);
        } catch (fallbackError) {
          console.error("Pollinations fallback also failed:", fallbackError);
          return "Our AI assistant is currently busy. Please try again in a moment or call us directly at 0727 774 279.";
        }
      }

      // For other errors, also try Pollinations
      console.log("Gemini error, attempting Pollinations.AI fallback...");
      try {
        return await getPollinationsResponse(message, history);
      } catch (fallbackError) {
        console.error("Pollinations fallback also failed:", fallbackError);
        return "I'm having a technical issue. Please call our sales line directly at 0727 774 279.";
      }
    }
  }

  // If Gemini not initialized, use Pollinations directly
  try {
    return await getPollinationsResponse(message, history);
  } catch (error) {
    console.error("Pollinations.AI Error:", error);
    return "I'm experiencing technical difficulties. Please call our sales team at 0727 774 279 for immediate assistance.";
  }
};