/**
 * API Service for Lead Management
 * 
 * SECURITY: This service calls Cloudflare Pages Functions (serverless)
 * instead of n8n directly. The Cloudflare Worker holds the n8n webhook
 * secrets safely and proxies requests to n8n.
 * 
 * Flow: React → Cloudflare Worker (/api/*) → n8n → PostgreSQL/Supabase
 * 
 * NOTE: In development mode, API calls are simulated since Cloudflare
 * Functions only work when deployed.
 */

// ============================================================================
// API CONFIGURATION
// Cloudflare Pages Functions will handle /api/* routes securely
// ============================================================================
const API_BASE = import.meta.env.VITE_API_BASE || '';

// Check if we're in development mode
const IS_DEV = import.meta.env.DEV;

// API endpoints (handled by Cloudflare Pages Functions)
const API_ENDPOINTS = {
    CONTACT_LEAD: `${API_BASE}/api/contact-lead`,
    NEWSLETTER: `${API_BASE}/api/newsletter`,
};

/**
 * Helper to simulate API calls in development mode
 */
async function devModeSimulation(endpoint: string, payload: unknown): Promise<{ success: true; message: string }> {
    console.log(`[DEV MODE] Would POST to ${endpoint}:`, payload);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Submission simulated (dev mode)' };
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ContactLeadPayload {
    name: string;
    email: string;
    phone: string;
    subject: string;  // Interest/subject selection
    message: string;
    source: 'contact_form';
    submittedAt: string;
}

export interface NewsletterPayload {
    email: string;
    source: 'newsletter_form';
    subscribedAt: string;
}

export interface ChatbotLeadPayload {
    phoneNumber: string;
    customerName?: string;
    inquirySummary: string;
    source: 'ai_chatbot';
    capturedAt: string;
}

export interface WebhookResponse {
    success: boolean;
    message: string;
    error?: string;
}

// ============================================================================
// WEBHOOK SUBMISSION FUNCTIONS
// ============================================================================

/**
 * Submit contact form lead via Cloudflare Pages Function
 * Includes Turnstile token for bot protection
 * Cloudflare Worker verifies token, then proxies to n8n which inserts into leads table
 */
export async function submitContactLead(
    data: Omit<ContactLeadPayload, 'source' | 'submittedAt'>,
    turnstileToken?: string
): Promise<WebhookResponse> {
    const payload = {
        ...data,
        source: 'contact_form' as const,
        submittedAt: new Date().toISOString(),
        turnstileToken, // Cloudflare Function verifies this
    };

    // In development, simulate the API call
    if (IS_DEV) {
        return devModeSimulation(API_ENDPOINTS.CONTACT_LEAD, payload);
    }

    try {
        const response = await fetch(API_ENDPOINTS.CONTACT_LEAD, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Parse response
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to submit lead',
                error: `HTTP ${response.status}`,
            };
        }

        return {
            success: true,
            message: result.message || 'Lead submitted successfully',
        };
    } catch (error) {
        console.error('Error submitting contact lead:', error);
        return {
            success: false,
            message: 'Failed to submit lead',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Submit newsletter subscription via Cloudflare Pages Function
 * Cloudflare Worker proxies to n8n (connected to info@provisionlands.co.ke)
 */
export async function submitNewsletterSubscription(email: string): Promise<WebhookResponse> {
    const payload: NewsletterPayload = {
        email,
        source: 'newsletter_form',
        subscribedAt: new Date().toISOString(),
    };

    // In development, simulate the API call
    if (IS_DEV) {
        return devModeSimulation(API_ENDPOINTS.NEWSLETTER, payload);
    }

    try {
        const response = await fetch(API_ENDPOINTS.NEWSLETTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return {
            success: true,
            message: 'Subscription successful',
        };
    } catch (error) {
        console.error('Error submitting newsletter subscription:', error);
        return {
            success: false,
            message: 'Failed to subscribe',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


