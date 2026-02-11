
import { COMPANY_INFO } from '../constants';

export const getChatResponse = async (
    message: string,
    history: { role: 'user' | 'model', text: string }[]
): Promise<string> => {

    // Create or retrieve a session ID
    let sessionId = sessionStorage.getItem('provision_chat_session_id');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('provision_chat_session_id', sessionId);
    }

    // Sanitize history for the API
    const cleanHistory = history.map(h => ({
        role: h.role,
        text: h.text
    }));

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                sessionId,
                history: cleanHistory,
                name: 'Website Visitor'
            }),
        });

        if (!response.ok) {
            throw new Error(`Chat API error: ${response.status}`);
        }

        const data = await response.json();
        return data.response || "I didn't quite catch that. Could you please repeat?";

    } catch (error) {
        console.error("Steve Service Error:", error);
        return "I'm having trouble connecting to the server. Please call us directly at " + COMPANY_INFO.phone;
    }
};
