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
                if (Array.isArray(data) && data.length > 0) return data;
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
            if (Array.isArray(data) && data.length > 0) return data;
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
    id: number;
    name: string;
    phone: string;
    interest: string;
    ai_summary: string;
    source: 'whatsapp' | 'website';
    status: string;
    created_at?: string;
    last_active?: string;
    lead_status?: string;
    // Mapped fields from Admin.tsx needs
    email?: string;
    message?: string;
    priority?: 'high' | 'normal' | 'low';
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
        return await response.json();
    } catch (err) {
        console.error('Error fetching leads:', err);
        return [];
    }
}

export async function updateLead(id: number, updates: Partial<Lead>): Promise<Lead> {
    const response = await fetch(`${API_BASE}/api/leads?id=${id}`, {
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
        throw new Error(`Failed to update lead: ${text}`);
    }
    return response.json();
}

export async function triggerFollowup(leadId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/leads/followup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify({ lead_id: leadId })
    });
    handleAuthError(response);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to trigger follow-up: ${text}`);
    }
}

export interface DashboardStats {
    totalLeads: string;
    newToday: string;
    actionRequired: string;
    conversionRate: string;
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
        return { totalLeads: '0', newToday: '0', actionRequired: '0', conversionRate: '0%' };
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
        const response = await fetch(`${API_BASE}/api/conversation-history?sender_id=${encodeURIComponent(senderId)}`, {
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
    const response = await fetch(`${API_BASE}/api/manual-followup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': getAdminSecret()
        },
        body: JSON.stringify({ sender_id: senderId, message })
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
