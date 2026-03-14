import { Property, BlogPost, InstallmentPlan, InstallmentPayment } from '../types';
import { PROPERTIES, BLOG_POSTS } from '../constants';

const API_BASE = import.meta.env.VITE_API_BASE || '';

// -----------------------------------------------------------------------
// Admin secret is stored in sessionStorage (not localStorage) so it is
// automatically cleared when the tab/browser is closed. This reduces the
// XSS exposure window and prevents the key from persisting indefinitely.
// -----------------------------------------------------------------------
export function getAdminSecret(): string {
    return sessionStorage.getItem('admin_secret') || '';
}

export function handleAuthError(response: Response) {
    if (response.status === 401 || response.status === 403) {
        // Secret is wrong or expired — clear it so the user is forced to re-login
        sessionStorage.removeItem('admin_secret');
    }
}


// --- Properties Service ---

export async function getProperties(): Promise<Property[]> {
    try {
        const response = await fetch(`${API_BASE}/api/properties`);

        // Check for HTML response (common when API is missing and SPA router catches request)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            console.warn("API Error: Endpoint returned HTML instead of JSON. This likely means the API route does not exist on the server (404 Page). check if functions are deployed.");
            return PROPERTIES;
        }

        if (response.ok) {
            try {
                const data = await response.json();
                if (Array.isArray(data)) return data;
                console.warn("API Error: Response data is empty or not an array:", data);
            } catch (e) {
                console.error("API Error: Failed to parse JSON:", e);
                const text = await response.text();
                console.debug("Raw response:", text.substring(0, 200)); // Log first 200 chars
            }
        } else {
            console.error(`Failed to fetch properties: ${response.status} ${response.statusText}`);
        }
    } catch (err) {
        console.error('Failed to fetch properties from API', err);
    }
    // Fallback to static constants if API has no data or fails
    return PROPERTIES;
}

export async function createProperty(property: Property): Promise<Property> {
    const response = await fetch(`${API_BASE}/api/properties`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(property)
    });

    handleAuthError(response);

    // Check for HTML response
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
        throw new Error("API Route Missing (Returned HTML). Function likely not deployed.");
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create property: ${text}`);
    }
    return response.json();
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const response = await fetch(`${API_BASE}/api/properties?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(updates)
    });

    handleAuthError(response);

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
        throw new Error("API Route Missing (Returned HTML). Function likely not deployed.");
    }

    if (!response.ok) {
        try {
            const err = await response.json() as any;
            throw new Error(err.error || 'Failed to update property');
        } catch (e) {
            throw new Error(`Failed to update property: ${response.status}`);
        }
    }
    return response.json();
}

export async function deleteProperty(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/properties?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
            'x-internal-secret': getAdminSecret()
        }
    });

    handleAuthError(response);

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
        throw new Error("API Route Missing (Returned HTML). Function likely not deployed.");
    }

    if (!response.ok) {
        throw new Error(`Failed to delete property: ${response.status}`);
    }
}


// --- Blog Posts Service ---

export async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        const response = await fetch(`${API_BASE}/api/blog-posts`);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) return data;
        }
    } catch (err) {
        console.warn('Failed to fetch blog posts from API');
    }
    return BLOG_POSTS; // Fallback to constants
}

export async function createBlogPost(post: BlogPost): Promise<BlogPost> {
    const response = await fetch(`${API_BASE}/api/blog-posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(post)
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const response = await fetch(`${API_BASE}/api/blog-posts?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(updates)
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to update post');
    return response.json();
}

export async function deleteBlogPost(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/blog-posts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
            'x-internal-secret': getAdminSecret()
        }
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to delete post');
}

// --- Leads Service (CRM) ---

export interface Lead {
    phone: string;
    last_seen: string;
    message_count: string | number;
    last_message: string;
    last_response: string;
    // Extended fields returned by updated SQL query (scan all history for names)
    name_message?: string; // first customer message in history that mentions a name
    name_response?: string; // first Steve response in history that addresses customer by name
    status: 'hot' | 'warm' | 'NEW' | 'converted' | 'cold' | 'CLOSED';
    converted?: boolean;   // from lead_status_overrides
    // Helper fields added by frontend
    name?: string;
    source?: 'whatsapp' | 'website';
}

/**
 * Strips JSON wrapping from website chatbot messages
 */
export function parseMessage(msg: string): string {
    if (!msg) return '';
    if (msg.startsWith('{') && msg.includes('"message"')) {
        try {
            const parsed = JSON.parse(msg);
            return parsed.message || msg;
        } catch {
            return msg;
        }
    }
    return msg;
}

/**
 * Formats a raw phone number into a readable local format.
 * E.g. 254707013776 → 0707 013 776
 */
export function formatPhone(phone: string): string {
    if (!phone) return 'Unknown';
    if (phone.startsWith('254') && phone.length === 12) {
        const local = '0' + phone.substring(3);
        return local.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return phone;
}

/**
 * Extracts a customer name from a conversation.
 * Scans both the customer's own message and Steve's response.
 * Pass name_message / name_response (from full history scan) for best results.
 */
export function extractName(lastResponse: string, lastMessage?: string): string | null {
    // First scan the CUSTOMER'S message for self-introduction patterns
    if (lastMessage) {
        const customerPatterns = [
            /(?:it'?s|I'?m|I am|my name is|this is|called|name'?s)\s+([A-Z][a-z]{2,})/i,
            /^([A-Z][a-z]{2,})\s+(?:here|speaking)/i,
            /^([A-Z][a-z]{2,})$/, // single word that looks like a name
        ];
        for (const pattern of customerPatterns) {
            const match = lastMessage.match(pattern);
            if (match?.[1]) {
                const blacklist = ['Steve', 'Provision', 'Land', 'Property', 'Hello', 'Hi', 'Hey', 'Yes', 'Okay', 'Sure', 'WhatsApp'];
                if (!blacklist.includes(match[1])) return match[1];
            }
        }
    }

    // Then scan ALL of Steve's response text for addressing the customer by name
    if (lastResponse) {
        // Special case: Scan [ALERT_SALES] tag for Customer field
        const alertMatch = lastResponse.match(/\[ALERT_SALES\].*Customer:\s*([A-Z][a-z]+)/i);
        if (alertMatch?.[1]) return alertMatch[1];

        const stevePatterns = [
            /(?:Hi|Hello|Hey|Thank you|Thanks|Great|Excellent|noted|Understood),?\s+([A-Z][a-z]{2,})[.!,\s]/,
            /([A-Z][a-z]{2,}),\s+(?:I've noted|that's|this is|your)/i,
            /your number,?\s+\*?([A-Z][a-z]{2,})\*?/i,
        ];
        for (const pattern of stevePatterns) {
            const match = lastResponse.match(pattern);
            if (match?.[1]) {
                const blacklist = ['Steve', 'Provision', 'Land', 'Property', 'Wait', 'Here', 'Let', 'The', 'Our', 'Your', 'This'];
                if (!blacklist.includes(match[1])) return match[1];
            }
        }
    }
    return null;
}

export async function getLeads(): Promise<Lead[]> {
    try {
        const response = await fetch(`${API_BASE}/api/leads`, {
            headers: {
                'x-internal-secret': getAdminSecret()
            }
        });
        if (!response.ok) {
            console.error(`Failed to fetch leads: ${response.status}`);
            throw new Error('Failed to fetch leads');
        }
        const data = await response.json() as Lead[];
        const INTERNAL_NUMBERS = ['254797331355', '254727774279'];
        return data
            .filter(l => !INTERNAL_NUMBERS.includes(l.phone))
            .map(l => {
                const isWhatsApp = /^254\d{9}$/.test(l.phone);
                const extractedName = extractName(l.name_response || l.last_response, l.name_message || l.last_message);
                
                return {
                    ...l,
                    name: extractedName || (isWhatsApp ? formatPhone(l.phone) : 'Website Visitor'),
                    source: isWhatsApp ? 'whatsapp' : 'website'
                };
            });
    } catch (err) {
        console.error('Error fetching leads:', err);
        return [];
    }
}

export async function updateLead(phone: string, updates: Partial<Lead>): Promise<Lead> {
    console.log('[updateLead] Updating lead:', phone, updates);
    const response = await fetch(`${API_BASE}/api/leads?phone=${encodeURIComponent(phone)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(updates)
    });
    handleAuthError(response);
    if (!response.ok) {
        const text = await response.text();
        console.error('[updateLead] Failed:', response.status, text);
        throw new Error(`Failed to update lead: ${text}`);
    }
    const result = await response.json();
    console.log('[updateLead] Success:', result);
    return result;
}

export async function triggerFollowup(phone: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/leads/followup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify({ phone })
    });
    handleAuthError(response);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to trigger follow-up: ${text}`);
    }
}

export interface DashboardStats {
    totalLeads: number;
    hotLeads: number;
    warmLeads: number;
    silentSevenDays: number;
    pipelineValue: string;
    convertedCount: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const response = await fetch(`${API_BASE}/api/leads?stats=true`, {
            headers: {
                'x-internal-secret': getAdminSecret()
            }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    } catch (err) {
        console.error('Error fetching stats:', err);
        return { 
            totalLeads: 0, hotLeads: 0, warmLeads: 0, 
            silentSevenDays: 0, pipelineValue: 'KES 0', convertedCount: 0 
        };
    }
}

// --- Site Visits Service ---

export interface SiteVisit {
    id: number;
    sender_id: string;
    customer_name: string;
    property_name: string;
    visit_day: string;
    visit_date: string; // ISO timestamp
    notes?: string;
    reminder_24hr_sent: boolean;
    reminder_morning_sent: boolean;
    status: string;
    created_at: string;
}

export async function getSiteVisits(): Promise<SiteVisit[]> {
    try {
        const response = await fetch(`${API_BASE}/api/site-visits`, {
            headers: { 'x-internal-secret': getAdminSecret() }
        });
        handleAuthError(response);
        if (!response.ok) throw new Error(`Failed to fetch site visits: ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('Error fetching site visits:', err);
        return [];
    }
}

export async function createSiteVisit(visit: Partial<SiteVisit>): Promise<SiteVisit> {
    const response = await fetch(`${API_BASE}/api/site-visits`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(visit)
    });
    handleAuthError(response);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create site visit: ${text}`);
    }
    return response.json();
}

export async function updateSiteVisit(id: number, updates: Partial<SiteVisit>): Promise<SiteVisit> {
    const response = await fetch(`${API_BASE}/api/site-visits?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(updates)
    });
    handleAuthError(response);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update site visit: ${text}`);
    }
    return response.json();
}

// --- WhatsApp CRM Service ---

export interface ConversationMessage {
    role: 'user' | 'assistant';
    message: string;
    created_at: string;
}

export async function getConversationHistory(senderId: string): Promise<ConversationMessage[]> {
    try {
        const response = await fetch(`${API_BASE}/api/conversations/${encodeURIComponent(senderId)}`, {
            headers: { 'x-internal-secret': getAdminSecret() }
        });
        handleAuthError(response);
        if (!response.ok) throw new Error(`Failed to fetch conversation: ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('Error fetching conversation history:', err);
        return [];
    }
}

export async function sendManualFollowup(senderId: string, message: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/followup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        // senderId is in 254xxxxxxxxx format — used as WhatsApp recipient directly
        body: JSON.stringify({ senderId, message })
    });
    handleAuthError(response);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to send follow-up: ${text}`);
    }
}

// --- Broadcasts Service ---

export interface BroadcastPayload {
    property_name: string;
    location: string;
    price: string;
    key_highlight: string;
    budget_min: number;
    budget_max: number;
}

export interface BroadcastRecord {
    id: number;
    property_name: string;
    price: string;
    sent_to: number;
    date_sent: string;
    status: string;
}

export async function sendInventoryBroadcast(data: BroadcastPayload): Promise<void> {
    const response = await fetch(`${API_BASE}/api/inventory-broadcast`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(data)
    });
    handleAuthError(response);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to send broadcast: ${text}`);
    }
}

export async function getBroadcastHistory(): Promise<BroadcastRecord[]> {
    try {
        const response = await fetch(`${API_BASE}/api/broadcast-history`, {
            headers: { 'x-internal-secret': getAdminSecret() }
        });
        handleAuthError(response);
        if (!response.ok) throw new Error(`Failed to fetch broadcast history: ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('Error fetching broadcast history:', err);
        return [];
    }
}

export async function getLeadsCount(budgetMin: number, budgetMax: number): Promise<number> {
    try {
        const response = await fetch(`${API_BASE}/api/leads/count?budget_min=${budgetMin}&budget_max=${budgetMax}`, {
            headers: { 'x-internal-secret': getAdminSecret() }
        });
        handleAuthError(response);
        if (!response.ok) return 0;
        const data = await response.json() as any;
        return data.count || 0;
    } catch {
        return 0;
    }
}

// --- Installment Plans Service ---

// --- Installment Plans Service ---

export async function getInstallmentPlans(): Promise<InstallmentPlan[]> {
    try {
        const response = await fetch(`${API_BASE}/api/installments`, {
            headers: { 'x-internal-secret': getAdminSecret() }
        });
        handleAuthError(response);
        if (!response.ok) throw new Error(`Failed to fetch plans: ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('Error fetching installment plans:', err);
        return [];
    }
}

export async function createInstallmentPlan(plan: Partial<InstallmentPlan>): Promise<InstallmentPlan> {
    const response = await fetch(`${API_BASE}/api/installments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(plan)
    });
    handleAuthError(response);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create plan: ${text}`);
    }
    return response.json();
}

export async function updateInstallmentPlan(id: number, updates: Partial<InstallmentPlan>): Promise<InstallmentPlan> {
    const response = await fetch(`${API_BASE}/api/installments?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(updates)
    });
    handleAuthError(response);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update plan: ${text}`);
    }
    return response.json();
}

export async function recordPayment(payment: Partial<InstallmentPayment>): Promise<InstallmentPayment> {
    const response = await fetch(`${API_BASE}/api/installment-payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify(payment)
    });
    handleAuthError(response);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to record payment: ${text}`);
    }
    return response.json();
}

export async function getPaymentHistory(planId: number): Promise<InstallmentPayment[]> {
    try {
        const response = await fetch(`${API_BASE}/api/installment-payments?plan_id=${planId}`, {
            headers: { 'x-internal-secret': getAdminSecret() }
        });
        handleAuthError(response);
        if (!response.ok) throw new Error(`Failed to fetch payment history: ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('Error fetching payment history:', err);
        return [];
    }
}

export async function verifyInstallmentsPin(pin: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/api/verify-installments-pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.success === true;
    } catch (err) {
        console.error('Error verifying installments PIN:', err);
        return false;
    }
}
