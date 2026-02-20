import { Property, BlogPost } from '../types';
import { BLOG_POSTS } from '../constants';

const API_BASE = import.meta.env.VITE_API_BASE || '';

// -----------------------------------------------------------------------
// Admin secret is stored in sessionStorage (not localStorage) so it is
// automatically cleared when the tab/browser is closed. This reduces the
// XSS exposure window and prevents the key from persisting indefinitely.
// -----------------------------------------------------------------------
function getAdminSecret(): string {
    return sessionStorage.getItem('admin_secret') || '';
}

function handleAuthError(response: Response) {
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
            return [];
        }

        if (response.ok) {
            try {
                const data = await response.json();
                if (Array.isArray(data)) return data;
                console.warn("API Error: Response data is not an array:", data);
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
    // If API fails, return empty array rather than stale constants as per instructions
    return [];
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
    return BLOG_POSTS; // Fallback allowed for blog if not specified otherwise
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
